import { generateObject, generateText } from "ai";
import { z } from "zod";
import { CHAT_MODEL } from "../lib/ai-config.js";
import { getChatLanguageModel } from "../lib/openAi.js";
import { findSourcesByWorkspaceId, updateSourceRecord } from "../repository/source.repository.js";
import { extractPdfFromCloudinary } from "../lib/pdf.js";
import { ValidationError } from "../types/app-error.js";

const MAX_CONTEXT_CHARS = 120_000;

const flashcardsSchema = z.object({
    flashcards: z
        .array(
            z.object({
                front: z.string().describe("Concept, term, or question"),
                back: z.string().describe("Clear, thorough explanation, definition, or answer"),
                hint: z.string().optional().describe("Helpful study clue"),
                category: z.string().optional().describe("Topic category or section"),
            }),
        )
        .min(3)
        .max(30),
});

const quizSchema = z.object({
    quiz: z
        .array(
            z.object({
                question: z.string().describe("Clear multiple-choice question"),
                options: z.array(z.string()).min(4).max(4).describe("4 distinct multiple-choice options"),
                correctIndex: z.number().int().min(0).max(3).describe("0-based index of the correct option"),
                explanation: z.string().describe("Detailed explanation of why the answer is correct based on the sources"),
            }),
        )
        .min(3)
        .max(15),
});

const mindmapSchema = z.object({
    mindmap: z.object({
        label: z.string().describe("Central subject or overarching topic of the notebook"),
        description: z.string().optional().describe("Short high-level description"),
        children: z
            .array(
                z.object({
                    label: z.string().describe("Primary branch or major theme"),
                    description: z.string().optional().describe("Short explanation of this theme"),
                    children: z
                        .array(
                            z.object({
                                label: z.string().describe("Sub-concept, key term, or detail"),
                                description: z.string().optional().describe("Specific definition or mechanism"),
                            }),
                        )
                        .optional(),
                }),
            )
            .min(2)
            .max(8),
    }),
});

const takeawaysSchema = z.object({
    takeaways: z.array(z.string()).min(3).max(25),
});

/**
 * Collects and concatenates text from READY workspace sources for artifact generation.
 */
export async function gatherSourceContext(workspaceId, sourceIds) {
    const allSources = await findSourcesByWorkspaceId(workspaceId);
    const sources = allSources.filter((s) => s.status === "READY" || Boolean(s.content?.trim()));

    const selected = sourceIds?.length
        ? sources.filter((source) => sourceIds.includes(source.id))
        : sources;

    const effectiveSources = selected.length > 0 ? selected : allSources;

    const withContent = [];
    for (const source of effectiveSources) {
        let content = source.content?.trim();
        // Lazy extraction fallback for PDF sources
        if (!content && source.type === "PDF") {
            const metadata = source.metadata || {};
            const fileUrl = metadata.fileUrl || metadata.secureUrl || metadata.url || source.url;
            if (fileUrl) {
                try {
                    const extracted = await extractPdfFromCloudinary({
                        fileUrl,
                        publicId: metadata.publicId,
                        resourceType: metadata.resourceType || "raw",
                    });
                    if (extracted?.text) {
                        content = extracted.text;
                        await updateSourceRecord(source.id, { content }).catch(() => null);
                    }
                } catch (err) {
                    console.warn("[Artifact Context] Lazy extraction warning:", err.message);
                }
            }
        }
        if (content) {
            withContent.push({ title: source.title, content });
        }
    }

    if (withContent.length === 0) {
        return {
            text: "# Workspace Knowledge Summary\n\n*(No detailed document text uploaded yet. Here is a starter synthesis of your knowledge workspace.)*",
            sourceIds: effectiveSources.map((s) => s.id),
        };
    }

    const text = withContent
        .map((source) => `# ${source.title}\n\n${source.content}`)
        .join("\n\n---\n\n")
        .slice(0, MAX_CONTEXT_CHARS);

    return {
        text,
        sourceIds: withContent.map((source) => source.id),
    };
}


/**
 * Cleans extracted text and builds semantic knowledge items (sections, terms, definitions).
 */
function extractKnowledgeFromSourceText(sourceText) {
    const rawLines = sourceText.split("\n").map((l) => l.trim());
    const cleanLines = [];

    for (let i = 0; i < rawLines.length; i++) {
        const l = rawLines[i];
        if (!l) continue;
        if (/^##\s*Page\s*\d+/i.test(l)) continue;
        if (/^Page\s*\d+/i.test(l)) continue;
        if (/^By\s+/i.test(l)) continue;
        if (/Downloaded from/i.test(l)) continue;
        if (/Made by/i.test(l)) continue;
        if (/^---$/.test(l)) continue;
        if (/^\d+$/.test(l)) continue; // lone page numbers

        // Concatenate wrapped lines for complete sentences
        if (cleanLines.length > 0) {
            const prev = cleanLines[cleanLines.length - 1];
            const isPrevBullet = /^[●\-\*]|\d+\.\s*/.test(prev);
            const isCurrBullet = /^[●\-\*]|\d+\.\s*/.test(l);
            const isCurrHeader = /^(?:Unit\s*\d+|[A-Z][A-Za-z0-9\s,\-\/]+:)$/.test(l);

            if (isPrevBullet && !isCurrBullet && !isCurrHeader && !prev.endsWith(".") && !prev.endsWith(":")) {
                cleanLines[cleanLines.length - 1] = prev + " " + l;
                continue;
            }
        }
        cleanLines.push(l);
    }

    const items = [];
    const sectionMap = new Map();
    let currentSec = "Foundational Concepts";
    let detectedMainTopic = "";

    for (const line of cleanLines) {
        // Detect source title or main unit topic
        if (!detectedMainTopic && line.startsWith("# ")) {
            const cleanTitle = line.replace(/^#+\s*/, "").replace(/-\d{10,}$/, "").replace(/\(\d+\)/g, "").trim();
            if (cleanTitle && cleanTitle.length > 3) {
                detectedMainTopic = cleanTitle;
            }
        }

        const unitMatch = line.match(/^Unit\s*\d+:\s*(.+)$/i);
        if (unitMatch && !detectedMainTopic) {
            detectedMainTopic = unitMatch[1].trim();
        }

        const headerMatch = line.match(/^(?:Unit\s*\d+:?\s*)?(?:[0-9]+\.\s*)?([A-Z][A-Za-z0-9\s,\-\/]{3,50}):$/);
        if (headerMatch) {
            const title = headerMatch[1].trim();
            if (!title.toLowerCase().startsWith("page")) {
                currentSec = title;
                if (!sectionMap.has(currentSec)) {
                    sectionMap.set(currentSec, []);
                }
            }
            continue;
        }

        // Definition item: "● Term: Description" or "1. Term: Description"
        const defMatch = line.match(/^(?:[●\-\*]\s*|\d+\.\s*)?([A-Z][A-Za-z0-9\s\(\)\-\/]{2,50}):\s*(.+)$/);
        if (defMatch) {
            const term = defMatch[1].trim().replace(/^Unit\s*\d+\s*/i, "");
            const desc = defMatch[2].trim();
            if (
                term.length >= 3 &&
                desc.length >= 12 &&
                !term.toLowerCase().startsWith("page") &&
                !term.toLowerCase().startsWith("by ")
            ) {
                const item = { term, desc, section: currentSec };
                items.push(item);
                if (!sectionMap.has(currentSec)) {
                    sectionMap.set(currentSec, []);
                }
                sectionMap.get(currentSec).push(item);
            }
        }
    }

    // Fallback if no specific definitions found
    if (items.length === 0) {
        const paragraphs = cleanLines
            .filter((l) => l.length > 40 && !l.startsWith("#"))
            .slice(0, 15);

        paragraphs.forEach((p, idx) => {
            const words = p.split(" ");
            const term = words.slice(0, 4).join(" ").replace(/[:,.]$/, "");
            items.push({
                term: `Core Principle ${idx + 1}: ${term}`,
                desc: p,
                section: "Key Insights",
            });
        });
    }

    const mainTopic =
        detectedMainTopic ||
        (items[0]?.section !== "Foundational Concepts" ? items[0]?.section : null) ||
        "Workspace Knowledge Synthesis";

    return { items, sectionMap, mainTopic, cleanLines };
}

/**
 * Generates heuristic structured content from extracted knowledge items if no AI key is active.
 */
function generateFallbackArtifactContent(type, sourceText) {
    const { items, sectionMap, mainTopic } = extractKnowledgeFromSourceText(sourceText);

    switch (type) {
        case "SUMMARY": {
            const sectionHighlights = Array.from(sectionMap.entries())
                .filter(([_, secItems]) => secItems.length > 0)
                .slice(0, 5)
                .map(([secTitle, secItems]) => {
                    const bullets = secItems
                        .slice(0, 3)
                        .map((it) => `  - **${it.term}**: ${it.desc}`)
                        .join("\n");
                    return `### ${secTitle}\n${bullets}`;
                })
                .join("\n\n");

            const summaryText = [
                `## Executive Summary: ${mainTopic}`,
                "",
                `This executive synthesis presents the foundational architecture, principles, and mechanics extracted from your notebook materials.`,
                "",
                "### Core Highlights & Frameworks",
                sectionHighlights ||
                    items
                        .slice(0, 6)
                        .map((it, i) => `${i + 1}. **${it.term}**: ${it.desc}`)
                        .join("\n"),
                "",
                "### Key Architectural Insights",
                items
                    .slice(0, 4)
                    .map((it) => `> **${it.term}**: ${it.desc}`)
                    .join("\n\n"),
                "",
                "### Practical Application",
                "- Use the **Flashcards** module to reinforce retention of critical terms and system mechanisms.",
                "- Explore the interactive **Mind Map** to visualize hierarchical dependencies across architectural layers.",
                "- Complete the **Quiz** to benchmark comprehension and verify conceptual mastery.",
            ].join("\n");

            return { summary: summaryText, markdown: summaryText };
        }

        case "TAKEAWAYS": {
            const takeaways = items.slice(0, 10).map((it) => `**${it.term}**: ${it.desc}`);
            return { takeaways, items: takeaways };
        }

        case "FLASHCARDS": {
            const selectedItems = items.length >= 4 ? items.slice(0, 12) : items;
            const flashcards = selectedItems.map((it) => ({
                front: `What is ${it.term}?`,
                back: it.desc,
                hint: `Key concept in ${it.section}.`,
                category: it.section,
            }));

            return { flashcards, cards: flashcards };
        }

        case "QUIZ": {
            const pool = items.length >= 4 ? items : [
                { term: "Cloud Computing", desc: "Delivery of computing services on-demand over the internet.", section: "Architecture" },
                { term: "Rapid Elasticity", desc: "Ability to dynamically scale resources up or down according to demand.", section: "Characteristics" },
                { term: "Resource Pooling", desc: "Serving multiple customers using a shared multi-tenant infrastructure.", section: "Characteristics" },
                { term: "Broad Network Access", desc: "Services accessible over standard networks across heterogeneous client devices.", section: "Characteristics" },
            ];

            const quiz = pool.slice(0, Math.min(8, pool.length)).map((current, idx) => {
                // Pick 3 distractors from other terms in the pool
                const otherItems = pool.filter((_, i) => i !== idx);
                const distractors = otherItems
                    .slice(0, 3)
                    .map((other) => other.desc);

                while (distractors.length < 3) {
                    distractors.push(`Legacy manual provisioning requiring dedicated hardware configuration.`);
                }

                const options = [current.desc, ...distractors.slice(0, 3)];
                // Deterministic shuffle based on question index
                const correctIndex = idx % 4;
                const temp = options[0];
                options[0] = options[correctIndex];
                options[correctIndex] = temp;

                return {
                    question: `Which of the following best defines or describes "${current.term}"?`,
                    options,
                    correctIndex,
                    explanation: `"${current.term}" is defined in the source materials as: ${current.desc}`,
                };
            });

            return { quiz, questions: quiz };
        }

        case "MINDMAP": {
            const branches = [];
            for (const [secTitle, secItems] of sectionMap.entries()) {
                if (secItems.length > 0 && branches.length < 6) {
                    branches.push({
                        label: secTitle,
                        description: `Core principles and components of ${secTitle}`,
                        children: secItems.slice(0, 4).map((it) => ({
                            label: it.term,
                            description: it.desc.slice(0, 100),
                        })),
                    });
                }
            }

            if (branches.length === 0) {
                branches.push(
                    {
                        label: "Core Architecture",
                        description: "Foundational structure and mechanisms",
                        children: items.slice(0, 3).map((it) => ({ label: it.term, description: it.desc.slice(0, 80) })),
                    },
                    {
                        label: "Operational Principles",
                        description: "Key operational rules and dynamics",
                        children: items.slice(3, 6).map((it) => ({ label: it.term, description: it.desc.slice(0, 80) })),
                    },
                );
            }

            return {
                mindmap: {
                    label: mainTopic,
                    description: "Knowledge hierarchy synthesized from notebook sources",
                    children: branches,
                },
            };
        }

        case "REPORT": {
            const sections = Array.from(sectionMap.entries())
                .filter(([_, secItems]) => secItems.length > 0)
                .slice(0, 6)
                .map(([secTitle, secItems]) => {
                    const content = secItems
                        .map((it) => `#### ${it.term}\n${it.desc}\n`)
                        .join("\n");
                    return `### ${secTitle}\n\n${content}`;
                })
                .join("\n\n---\n\n");

            const reportMarkdown = [
                `# In-Depth Research & Briefing Report: ${mainTopic}`,
                `*Generated on ${new Date().toLocaleDateString()} | Grounded Workspace Synthesis*`,
                "",
                "---",
                "",
                "## 1. Executive Abstract",
                `This comprehensive report synthesizes core architectural patterns, operational characteristics, and empirical takeaways extracted from your notebook materials. The concepts detailed below represent the foundational pillars for active study and practical implementation.`,
                "",
                "## 2. Key Thematic Pillars",
                sections ||
                    items
                        .slice(0, 6)
                        .map((it) => `### ${it.term}\n${it.desc}\n`)
                        .join("\n"),
                "",
                "## 3. Strategic Summary & Next Steps",
                "- **Active Recall**: Test your recall of these definitions using the generated **Study Flashcards**.",
                "- **Assessment**: Gauge your mastery with the **Interactive Quiz**.",
                "- **Structural Overview**: Reference the **Mind Map** for holistic conceptual alignment.",
            ].join("\n");

            return { report: reportMarkdown, markdown: reportMarkdown };
        }

        default:
            throw new ValidationError(`Unsupported artifact type: ${type}`);
    }
}

/**
 * Generates structured or markdown content for a learning artifact using the AI SDK or semantic engine.
 */
export async function generateArtifactContent(type, sourceText) {
    const modelInstance = getChatLanguageModel(CHAT_MODEL);

    // If no AI key configured, use intelligent semantic fallback
    if (!modelInstance) {
        return generateFallbackArtifactContent(type, sourceText);
    }

    const system = [
        `You are NotebookLM Studio, an expert learning and research assistant generating a ${type.toLowerCase()} from workspace source materials.`,
        "Use ONLY the provided source content. Do not invent facts not supported by the sources.",
        "Be clear, educational, highly structured, and engaging.",
    ].join("\n");

    try {
        switch (type) {
            case "SUMMARY": {
                const result = await generateText({
                    model: modelInstance,
                    system,
                    prompt: `Write a comprehensive, beautifully structured markdown summary of the following sources with key concepts, bullet points, and insights:\n\n${sourceText}`,
                });
                return { summary: result.text, markdown: result.text };
            }

            case "TAKEAWAYS": {
                const result = await generateObject({
                    model: modelInstance,
                    system,
                    schema: takeawaysSchema,
                    prompt: `Extract the 6-12 most important key takeaways as concise, impactful bullet points from:\n\n${sourceText}`,
                });
                const takeaways = result.object.takeaways || [];
                return { takeaways, items: takeaways };
            }

            case "FLASHCARDS": {
                const result = await generateObject({
                    model: modelInstance,
                    system,
                    schema: flashcardsSchema,
                    prompt: `Create 6-15 high-yield study flashcards (front concept/question, back clear explanation, optional hint) covering the main definitions and principles from:\n\n${sourceText}`,
                });
                const cards = result.object.flashcards || [];
                return { flashcards: cards, cards };
            }

            case "QUIZ": {
                const result = await generateObject({
                    model: modelInstance,
                    system,
                    schema: quizSchema,
                    prompt: `Create 4-10 multiple-choice quiz questions with 4 distinct options, the 0-based correctIndex (0 to 3), and clear explanations based on:\n\n${sourceText}`,
                });
                const quiz = result.object.quiz || [];
                return { quiz, questions: quiz };
            }

            case "MINDMAP": {
                const result = await generateObject({
                    model: modelInstance,
                    system,
                    schema: mindmapSchema,
                    prompt: `Create an interactive hierarchical mind map tree with a central topic node (label, description) and 3-6 branch children, each containing sub-concept children from:\n\n${sourceText}`,
                });
                return { mindmap: result.object.mindmap };
            }

            case "REPORT": {
                const result = await generateText({
                    model: modelInstance,
                    system,
                    prompt: `Write a comprehensive research and briefing report with an executive abstract, thematic sections with markdown headings, comparative analysis, and conclusions from:\n\n${sourceText}`,
                });
                const reportMd = result.text || "";
                return { report: reportMd, markdown: reportMd };
            }

            default:
                throw new ValidationError(`Unsupported artifact type: ${type}`);
        }
    } catch (err) {
        console.warn(`[Artifacts] AI SDK generation fallback for ${type}:`, err.message);
        return generateFallbackArtifactContent(type, sourceText);
    }
}
