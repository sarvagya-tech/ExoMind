import { RAG_MIN_SCORE, RAG_TOP_K } from "../ai-config.js";
import { embedTexts } from "../openAi.js";
import { queryWorkspaceVectors } from "../pinecone.js";
import { findSourcesByWorkspaceId } from "../../repository/source.repository.js";

/**
 * Normalizes words for fuzzy/stemmed matching.
 */
function normalizeWord(w) {
    return w
        .toLowerCase()
        .replace(/^evoluation$/, "evolution")
        .replace(/^virtulization$/, "virtualization")
        .replace(/^charateristics$/, "characteristics")
        .replace(/ies$/, "y")
        .replace(/s$/, "")
        .replace(/ing$/, "")
        .replace(/tion$/, "")
        .replace(/ment$/, "");
}

/**
 * Cleans boilerplate lines and extracts structured semantic passages with page awareness from source text.
 */
export function extractCleanSemanticPassages(rawText) {
    if (!rawText) return [];

    const lines = rawText.split("\n").map((l) => l.trim());
    const cleanItems = []; // Array of { text, page }
    let currentPage = 1;

    for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        if (!l) continue;

        // Detect page markers like "## Page 2" or "Page 2"
        const pageMatch = l.match(/^##\s*Page\s*(\d+)/i) || l.match(/^Page\s*(\d+)/i);
        if (pageMatch) {
            currentPage = parseInt(pageMatch[1], 10) || currentPage;
            continue;
        }

        if (/^By\s+/i.test(l)) continue;
        if (/Downloaded from/i.test(l)) continue;
        if (/Made by/i.test(l)) continue;
        if (/^---$/.test(l)) continue;
        if (/^\d+$/.test(l)) continue; // lone page numbers

        // Concatenate wrapped lines
        if (cleanItems.length > 0) {
            const prevItem = cleanItems[cleanItems.length - 1];
            const prev = prevItem.text;
            const isPrevBullet = /^[●\-\*]|\d+\.\s*/.test(prev);
            const isCurrBullet = /^[●\-\*]|\d+\.\s*/.test(l);
            const isCurrHeader = /^(?:Unit\s*\d+|[0-9]+\.\s+[A-Z]|[A-Z][A-Za-z0-9\s,\-\/]+:)$/.test(l);

            if (isPrevBullet && !isCurrBullet && !isCurrHeader && !prev.endsWith(".") && !prev.endsWith(":")) {
                prevItem.text = prev + " " + l;
                continue;
            }
        }
        cleanItems.push({ text: l, page: currentPage });
    }

    // Group into coherent semantic blocks with preserved page info
    const blocks = [];
    let currentBlock = [];
    let currentLen = 0;
    let blockPage = 1;

    for (let i = 0; i < cleanItems.length; i++) {
        const item = cleanItems[i];
        const line = item.text;
        const isHeader = /^(?:Unit\s*\d+:?|[0-9]+\.\s+[A-Z]|[A-Z][A-Za-z0-9\s,\-\/]{3,50}:)/.test(line);

        if (currentBlock.length === 0) {
            blockPage = item.page;
        }

        if (isHeader && currentBlock.length > 0 && currentLen > 400) {
            blocks.push({
                text: currentBlock.join("\n"),
                page: blockPage,
            });
            currentBlock = [];
            currentLen = 0;
            blockPage = item.page;
        }

        currentBlock.push(line);
        currentLen += line.length;

        if (currentLen > 1600) {
            blocks.push({
                text: currentBlock.join("\n"),
                page: blockPage,
            });
            currentBlock = [];
            currentLen = 0;
            blockPage = item.page;
        }
    }

    if (currentBlock.length > 0) {
        blocks.push({
            text: currentBlock.join("\n"),
            page: blockPage,
        });
    }

    return blocks;
}

/**
 * Calculates a relevance score between a passage and the user query.
 */
function scorePassage(passage, query, queryTokens, normalizedQueryTokens) {
    let score = 0;
    const lower = passage.toLowerCase();
    const cleanQuery = query.toLowerCase().trim();
    const lines = passage.split("\n").map((l) => l.trim()).filter(Boolean);

    // 1. Heavily penalize blocks that are lists of exam/PYQ questions
    const questionActionCount = lines.filter((l) =>
        /^(?:\d+[\.\)]|\([a-z0-9]+\))\s*(?:define|demonstrate|describe|list out|explain|differentiate|write short|compare|what is|state the|give the)/i.test(l)
    ).length;
    const questionMarkCount = lines.filter((l) => l.includes("?") || /\[\d+M\]/i.test(l)).length;
    const hasPyqTitle =
        lower.includes("important and pyq") ||
        lower.includes("pyq's questions") ||
        lower.includes("pyq’s questions") ||
        lower.includes("unit wise pyq") ||
        lower.includes("pyq questions");

    if (questionActionCount >= 2 || questionMarkCount >= 2 || hasPyqTitle) {
        score -= 300;
    }

    // 2. Exact query phrase match
    if (cleanQuery.length > 5 && lower.includes(cleanQuery)) {
        score += 50;
    }

    // 3. Section title / First line match
    const firstLine = lines[0]?.toLowerCase() || "";
    for (let i = 0; i < queryTokens.length; i++) {
        const raw = queryTokens[i];
        const norm = normalizedQueryTokens[i];

        if (firstLine.includes(raw) || firstLine.includes(norm)) {
            score += 40;
        }
    }

    // 4. Structured definition & numbered concept pattern bonus
    const hasStructuredDefinitions = lines.some((l) => /^[●\-\*]|\d+\.\s+[A-Z][A-Za-z0-9\s\(\)\-\/]+:/.test(l));
    if (hasStructuredDefinitions) {
        score += 25;
    }

    // 5. Keyword matching and density
    let matchedTokenCount = 0;
    for (let i = 0; i < queryTokens.length; i++) {
        const raw = queryTokens[i];
        const norm = normalizedQueryTokens[i];

        const rawRegex = new RegExp(`\\b${raw}\\b`, "gi");
        const rawMatches = lower.match(rawRegex);
        if (rawMatches) {
            score += Math.min(rawMatches.length * 3, 15);
            matchedTokenCount++;
        } else if (norm && lower.includes(norm)) {
            score += 4;
            matchedTokenCount++;
        }
    }

    // Boost if all major query tokens appear in the passage
    if (queryTokens.length > 1 && matchedTokenCount >= queryTokens.length) {
        score += 30;
    }

    return score;
}

/**
 * Retrieves relevant source chunks for a chat query via Pinecone vector similarity
 * and multi-stage semantic passage matching.
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
    const sourceIds =
        typeof workspaceIdOrObj === "object" && workspaceIdOrObj !== null
            ? workspaceIdOrObj.sourceIds || workspaceIdOrObj.selectedSourceIds
            : undefined;

    const vectorChunks = [];

    // 1. Try vector retrieval via Pinecone
    try {
        const [embedding] = await embedTexts([query]);

        if (embedding && embedding.length > 0) {
            const matches = await queryWorkspaceVectors(
                workspaceId,
                embedding,
                RAG_TOP_K * 2,
            );

            for (const match of matches) {
                const score = match.score ?? 0;
                if (score < 0.35) continue;

                const metadata = match.metadata;
                if (
                    metadata &&
                    typeof metadata.sourceId === "string" &&
                    typeof metadata.sourceTitle === "string" &&
                    typeof metadata.text === "string"
                ) {
                    if (sourceIds?.length && !sourceIds.includes(metadata.sourceId)) {
                        continue;
                    }

                    vectorChunks.push({
                        sourceId: metadata.sourceId,
                        sourceTitle: metadata.sourceTitle,
                        sourceType: metadata.sourceType || "SOURCE",
                        chunkId: metadata.chunkId || match.id,
                        chunkIndex: Number(metadata.chunkIndex ?? 0),
                        ...(typeof metadata.page === "number" ? { page: metadata.page } : {}),
                        text: metadata.text,
                        score,
                    });
                }
            }
        }
    } catch (err) {
        console.warn("[RAG] Pinecone vector search warning:", err.message);
    }

    // 2. High-precision semantic text search across workspace sources & database chunks
    const semanticChunks = [];
    try {
        const allSources = await findSourcesByWorkspaceId(workspaceId);
        const readySources = allSources.filter(
            (s) => s.status === "READY" && (s.content && s.content.trim().length > 0),
        );

        const targetSources = sourceIds?.length
            ? readySources.filter((s) => sourceIds.includes(s.id))
            : readySources;

        const effectiveSources = targetSources.length > 0 ? targetSources : readySources;

        const stopWords = new Set([
            "teach", "me", "the", "of", "in", "and", "a", "an", "to", "for", "is", "are",
            "what", "how", "explain", "tell", "about", "give", "can", "you", "please", "with",
        ]);

        const queryTokens = (query || "")
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .filter((w) => w.length >= 3 && !stopWords.has(w));

        const normalizedQueryTokens = queryTokens.map(normalizeWord);

        for (const source of effectiveSources) {
            // Extract semantic passages from full source content
            if (source.content) {
                const passages = extractCleanSemanticPassages(source.content);

                passages.forEach((passageObj, idx) => {
                    const passageText = typeof passageObj === "object" ? passageObj.text : passageObj;
                    const passagePage = typeof passageObj === "object" ? passageObj.page : 1;
                    const score = scorePassage(passageText, query, queryTokens, normalizedQueryTokens);
                    if (score > 0 || effectiveSources.length === 1) {
                        semanticChunks.push({
                            sourceId: source.id,
                            sourceTitle: source.title,
                            sourceType: source.type,
                            chunkId: `${source.id}-${idx}`,
                            chunkIndex: idx,
                            page: passagePage,
                            text: passageText,
                            score: score || 1,
                            passagesRef: passages,
                        });
                    }
                });
            }
        }

        semanticChunks.sort((a, b) => b.score - a.score);
    } catch (err) {
        console.warn("[RAG] Semantic search error:", err.message);
    }

    // 3. Merge & Deduplicate Results
    const combined = [];
    const seenTexts = new Set();

    // Prefer high scoring semantic matches
    for (const chunk of semanticChunks.slice(0, 8)) {
        const key = chunk.text.slice(0, 100);
        if (!seenTexts.has(key)) {
            seenTexts.add(key);

            // If this passage has a subsequent continuation block, include it for completeness
            if (chunk.passagesRef && chunk.passagesRef[chunk.chunkIndex + 1] && chunk.score > 20) {
                const nextPassageObj = chunk.passagesRef[chunk.chunkIndex + 1];
                const nextText = typeof nextPassageObj === "object" ? nextPassageObj.text : nextPassageObj;
                if (nextText && !nextText.toLowerCase().startsWith("unit ")) {
                    chunk.text = `${chunk.text}\n\n${nextText}`;
                }
            }

            combined.push({
                sourceId: chunk.sourceId,
                sourceTitle: chunk.sourceTitle,
                sourceType: chunk.sourceType,
                chunkId: chunk.chunkId,
                chunkIndex: chunk.chunkIndex,
                page: chunk.page,
                text: chunk.text,
                score: chunk.score,
            });
        }
    }

    // Append vector chunks if any
    for (const chunk of vectorChunks) {
        const key = chunk.text.slice(0, 100);
        if (!seenTexts.has(key) && combined.length < 8) {
            seenTexts.add(key);
            combined.push(chunk);
        }
    }

    return combined;
}

/**
 * Synthesizes a friendly, intelligent pedagogical markdown answer from retrieved passages for offline/fallback mode.
 */
export function synthesizeFallbackGroundedAnswer(query, chunks) {
    if (!chunks || chunks.length === 0) {
        return [
            "Hey! I don't see any sources uploaded to this notebook yet.",
            "",
            "Drop in some PDF files, text notes, websites, or YouTube links on the left panel, and I'll break everything down for you step-by-step with exact page and chunk citations! 🚀",
        ].join("\n");
    }

    const primaryChunk = chunks[0];
    const sourceTitle = primaryChunk.sourceTitle || "Grounded Material";
    const pageNum = primaryChunk.page || 1;
    const chunkNum = primaryChunk.chunkIndex !== undefined ? primaryChunk.chunkIndex + 1 : 1;
    const citationTag = `[1] (Page ${pageNum}, Chunk #${chunkNum})`;

    const lines = primaryChunk.text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("## Page") && !l.startsWith("By ") && !l.includes("Downloaded from") && !l.startsWith("Made by"));

    // Extract section heading
    let title = "Core Concepts & Architecture";
    const headerLine = lines.find((l) => /^(?:[0-9]+\.\s+|Unit\s*\d+:?\s*)?[A-Z][A-Za-z0-9\s,\-\/]+:?$/.test(l));
    if (headerLine) {
        title = headerLine.replace(/^#+\s*/, "").replace(/^Unit\s*\d+:?\s*/i, "").replace(/:$/, "").trim();
    } else {
        const qTitle = query.replace(/^(what is|teach me|explain|describe|tell me about)\s+/i, "").trim();
        if (qTitle.length > 2) {
            title = qTitle.charAt(0).toUpperCase() + qTitle.slice(1);
        }
    }

    const formattedPoints = [];
    for (const line of lines) {
        if (line === headerLine) continue;

        // Numbered point: "1. Distributed Computing (1950s): Early computing..."
        const stageMatch = line.match(/^([0-9]+\.\s+[A-Z][A-Za-z0-9\s\(\)\-\/]+):\s*(.+)$/);
        if (stageMatch) {
            formattedPoints.push(`### ${stageMatch[1]}\n${stageMatch[2]} ${citationTag}`);
            continue;
        }

        // Bullet point: "● Mainframe Computing: Many users accessed..."
        const bulletMatch = line.match(/^[●\-\*]\s*([A-Z][A-Za-z0-9\s\(\)\-\/]+):\s*(.+)$/);
        if (bulletMatch) {
            formattedPoints.push(`- **${bulletMatch[1]}**: ${bulletMatch[2]} ${citationTag}`);
            continue;
        }

        if (line.length > 30 && !line.startsWith("Downloaded from")) {
            formattedPoints.push(`${line} ${citationTag}`);
        }
    }

    return [
        `## ${title}`,
        "",
        `Hey! Let's dive into **${title}** together. Here is a clear, step-by-step breakdown based directly on your source material in **${sourceTitle}** (${citationTag}):`,
        "",
        formattedPoints.join("\n\n"),
        "",
        "---",
        `💡 *Grounded in **${sourceTitle}** • Page ${pageNum}, Chunk #${chunkNum}. Let me know if you want to quiz yourself or explore any part in more detail!*`,
    ].join("\n");
}

/**
 * Builds the system prompt for the chat model, injecting citations and friendly teaching context.
 */
export function buildChatSystemPrompt(input) {
    const sections = [
        "You are NotebookLM, a friendly, engaging study buddy and mentor who loves teaching. You explain complex ideas clearly, intuitively, and conversationally — like a brilliant friend sharing notes and insights over coffee.",
        "",
        "### 🌟 Core Persona & Teaching Guidelines:",
        "- **Warm & Encouraging Friend**: Be conversational, approachable, and enthusiastic. Use natural transitions ('Here is how this works...', 'Think of it this way...', 'Let's break this down step-by-step!'). Never be robotic, stiff, or dry.",
        "- **Preserve Original Depth & Technical Accuracy**: Teach the concepts thoroughly without dumbing down or removing essential details from the grounded sources. Maintain all original technical depth, definitions, architectures, mechanisms, and nuances from the user's materials.",
        "- **Structured Pedagogical Format**: Use clear Markdown headings (##, ###), bullet points, bold key terms, and visual lists so the explanation is a joy to read and study.",
        "- **Exact Inline Citations with Page & Chunk Number**: Every time you teach or cite a concept, definition, mechanism, or stage from a grounded source, cite it explicitly with its Source Number, Page Number (if available), and Chunk Number.",
        "  - Format: `[1] (Page X, Chunk #Y)` or `[1] (Page X)` or `[2] (Chunk #Y)` matching the Grounded Sources listed below.",
        "- **Engaging Takeaway / Study Check-In**: Wrap up each explanation with a friendly summary or study tip encouraging the user to explore deeper or test their recall.",
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
                : "Answer helpfully as a friendly teacher from general knowledge and warmly encourage the user to add documents or websites on the left panel so you can cite exact pages and chunks.",
            "Do not invent citations when no sources are present.",
        );

        return sections.join("\n");
    }

    // Convert retrieved chunks into context for the AI
    const context = input.chunks
        .map((chunk, index) => {
            const pageTag = chunk.page ? `Page ${chunk.page}` : "Document";
            const chunkNum = chunk.chunkIndex !== undefined ? chunk.chunkIndex + 1 : index + 1;
            const label = `[${index + 1}] "${chunk.sourceTitle}" (${chunk.sourceType}) — 📍 ${pageTag} | 🔖 Chunk #${chunkNum}`;

            return `### Source ${index + 1}: ${label}\n${chunk.text}`;
        })
        .join("\n\n---\n\n");

    sections.push(
        "### Grounded Workspace Sources Context:",
        context,
        "",
        "### Instructions for Answering:",
        "1. **Friendly Hook**: Begin with an engaging, friendly introduction explaining what the topic is all about.",
        "2. **In-Depth Structured Breakdown**: Teach the concepts step-by-step with descriptive headings (##, ###), bullet points, and bold terms based strictly on the grounded sources.",
        "3. **Exact Page & Chunk Citations**: Tag key definitions, mechanisms, and stages with `[SourceNum] (Page X, Chunk #Y)` so the user knows exactly where in their documents it appears.",
        "4. **Takeaway**: Conclude with a warm, helpful summary or encouraging study check-in.",
    );

    return sections.join("\n");
}