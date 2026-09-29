import { RAG_MIN_SCORE, RAG_TOP_K } from "../ai-config.js";
import { embedTexts } from "../openAi.js";
import { queryWorkspaceVectors } from "../pinecone.js";
import { findSourcesByWorkspaceId } from "../../repository/source.repository.js";

/**
 * Retrieves relevant source chunks for a chat query via Pinecone vector similarity,
 * with fail-safe fallback to database source content.
 */
export async function retrieveWorkspaceContext(workspaceIdOrObj, maybeQuery) {
    const workspaceId =
        typeof workspaceIdOrObj === "object" && workspaceIdOrObj !== null
            ? workspaceIdOrObj.workspaceId
            : workspaceIdOrObj;
    const query =
        typeof workspaceIdOrObj === "object" && workspaceIdOrObj !== null
            ? workspaceIdOrObj.query
            : maybeQuery;

    const chunks = [];

    // 1. Try vector retrieval via Pinecone
    try {
        const [embedding] = await embedTexts([query]);

        if (embedding && embedding.length > 0) {
            const matches = await queryWorkspaceVectors(
                workspaceId,
                embedding,
                RAG_TOP_K,
            );

            for (const match of matches) {
                const score = match.score ?? 0;

                if (score < 0.25) {
                    continue;
                }

                const metadata = match.metadata;

                if (
                    metadata &&
                    typeof metadata.sourceId === "string" &&
                    typeof metadata.sourceTitle === "string" &&
                    typeof metadata.text === "string"
                ) {
                    chunks.push({
                        sourceId: metadata.sourceId,
                        sourceTitle: metadata.sourceTitle,
                        sourceType: metadata.sourceType || "SOURCE",
                        chunkId: metadata.chunkId || match.id,
                        chunkIndex: Number(metadata.chunkIndex ?? 0),
                        ...(typeof metadata.page === "number"
                            ? { page: metadata.page }
                            : {}),
                        text: metadata.text,
                        score,
                    });
                }
            }
        }
    } catch (err) {
        console.warn("[RAG] Pinecone vector search warning:", err.message);
    }

    // 2. If Pinecone had matches, return them
    if (chunks.length > 0) {
        return chunks;
    }

    // 3. Fallback: Query all ready sources in this workspace directly from PostgreSQL
    try {
        const dbSources = await findSourcesByWorkspaceId(workspaceId);
        const readySources = dbSources.filter(
            (s) => s.status === "READY" && s.content && s.content.trim().length > 0,
        );

        if (readySources.length > 0) {
            for (const source of readySources) {
                const fullText = source.content.trim();

                // Split source content into passages of ~1500 chars
                const segmentSize = 1500;
                const segments = [];
                for (let i = 0; i < fullText.length; i += segmentSize) {
                    segments.push(fullText.slice(i, i + segmentSize));
                    if (segments.length >= 4) break;
                }

                for (let idx = 0; idx < segments.length; idx++) {
                    chunks.push({
                        sourceId: source.id,
                        sourceTitle: source.title,
                        sourceType: source.type,
                        chunkId: `${source.id}-${idx}`,
                        chunkIndex: idx,
                        text: segments[idx],
                        score: 0.9,
                    });
                }
            }
        }
    } catch (dbErr) {
        console.warn("[RAG] DB source fallback warning:", dbErr.message);
    }

    return chunks;
}

/**
 * Builds the system prompt for the chat model, injecting citations and context.
 */
export function buildChatSystemPrompt(input) {
    const sections = [
        "You are NotebookLM Studio, an intelligent research and learning assistant.",
        "Your role is to deeply understand the user's grounded sources, explain concepts clearly with rich structure, headings, bullet points, and precise inline citations [1], [2] matching the source numbers.",
    ];

    // Add web-search instructions
    if (input.webSearchEnabled) {
        sections.push(
            "You have access to a web_search tool for up-to-date live internet intelligence.",
            "Use it when the user asks about recent events or benchmarks outside their sources.",
            "Cite web results inline using [W1], [W2] matching web result items.",
        );
    }

    // Add user memories
    if (input.userMemories?.length) {
        const memoryBlock = input.userMemories
            .map((memory) => `- ${memory}`)
            .join("\n");

        sections.push(
            "Known facts & preferences about this user:",
            memoryBlock,
        );
    }

    // Add conversation summary
    if (input.conversationSummary) {
        sections.push(
            "Summary of conversation so far:",
            input.conversationSummary,
        );
    }

    // If there are no sources, guide the AI accordingly
    if (!input.chunks?.length) {
        sections.push(
            input.webSearchEnabled
                ? "Use live web search to answer the user's question."
                : "Answer helpfully from general knowledge and encourage the user to add documents or websites on the left panel.",
            "Do not invent citations when no sources are present.",
        );

        return sections.join("\n");
    }

    // Convert retrieved chunks into context for the AI
    const context = input.chunks
        .map((chunk, index) => {
            const label =
                `[${index + 1}] ${chunk.sourceTitle} (${chunk.sourceType})` +
                (chunk.page ? `, page ${chunk.page}` : "");

            return `### Source ${index + 1}: ${label}\n${chunk.text}`;
        })
        .join("\n\n---\n\n");

    sections.push(
        "### Grounded Workspace Sources Context:",
        context,
        "",
        "### Instructions for Answering:",
        "1. Answer the user's question thoroughly, clearly, and insightfully based on the Grounded Workspace Sources provided above.",
        "2. Format your response with clean Markdown: use descriptive headings (##, ###), bullet lists, concise explanations, and structured summaries.",
        "3. Cite your sources inline using [1], [2], etc. corresponding to the numbered source blocks whenever stating facts from that source.",
        "4. Synthesize the concepts in your own structured, pedagogical words rather than simply copy-pasting raw text unformatted.",
    );

    return sections.join("\n");
}