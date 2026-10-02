import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { EMBEDDING_DIMENSIONS } from "./ai-config.js";

/**
 * Returns the appropriate AI chat model instance based on configured environment keys.
 * Supports Gemini (GEMINI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY) and OpenAI (OPENAI_API_KEY).
 */
export function getChatLanguageModel(modelName) {
    const geminiKey =
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
        const googleProvider = createGoogleGenerativeAI({ apiKey: geminiKey });
        const targetModel =
            modelName && typeof modelName === "string" && modelName.startsWith("gemini") && !modelName.includes("3.5") && !modelName.includes("2.0") && !modelName.includes("1.5")
                ? modelName
                : "gemini-3.8-flash";
        return googleProvider(targetModel);
    }


    if (openaiKey) {
        const openaiProvider = createOpenAI({ apiKey: openaiKey });
        let target = "gpt-4o-mini";
        if (modelName === "gpt-4o" || modelName === "gemini-1.5-pro") {
            target = "gpt-4o";
        }
        return openaiProvider(target);
    }

    return null;
}

/**
 * Deterministic bag-of-words normalized embedding fallback
 */
function generateDeterministicEmbedding(text, dimension = 1024) {
    const vector = new Array(dimension).fill(0);
    const words = String(text || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        let hash = 0;
        for (let j = 0; j < word.length; j++) {
            hash = (hash << 5) - hash + word.charCodeAt(j);
            hash |= 0;
        }
        const idx = Math.abs(hash) % dimension;
        vector[idx] += 1.0;
    }

    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1.0;
    return vector.map((v) => v / norm);
}

/**
 * Generates vector embeddings for an array of texts.
 * Uses Gemini (batchEmbedContents), OpenAI, or deterministic fallback.
 */
export async function embedTexts(texts) {
    if (!texts || texts.length === 0) {
        return [];
    }

    const targetDim = EMBEDDING_DIMENSIONS || 1024;
    const geminiKey =
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. Try Gemini Batch Embeddings
    if (geminiKey) {
        try {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
            const batchSize = 25;
            const embeddings = [];

            for (let i = 0; i < texts.length; i += batchSize) {
                const batch = texts.slice(i, i + batchSize);
                try {
                    const res = await model.batchEmbedContents({
                        requests: batch.map((t) => ({
                            content: { parts: [{ text: t.slice(0, 8000) }] },
                        })),
                    });

                    if (res.embeddings && res.embeddings.length === batch.length) {
                        for (const item of res.embeddings) {
                            let values = item.values;
                            if (values.length !== targetDim) {
                                if (values.length > targetDim) {
                                    values = values.slice(0, targetDim);
                                } else {
                                    values = [
                                        ...values,
                                        ...new Array(targetDim - values.length).fill(0),
                                    ];
                                }
                            }
                            embeddings.push(values);
                        }
                    } else {
                        throw new Error("Mismatched batch embedding count");
                    }
                } catch (batchErr) {
                    console.warn(`[Embeddings] Gemini batch ${i / batchSize + 1} fallback:`, batchErr.message);
                    for (const text of batch) {
                        embeddings.push(generateDeterministicEmbedding(text, targetDim));
                    }
                }
            }

            if (embeddings.length === texts.length) {
                return embeddings;
            }
        } catch (err) {
            console.warn("[Embeddings] Gemini embedding warning:", err.message);
        }
    }

    // 2. Try OpenAI Embeddings
    if (openaiKey) {
        try {
            const res = await fetch("https://api.openai.com/v1/embeddings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${openaiKey}`,
                },
                body: JSON.stringify({
                    model: "text-embedding-3-small",
                    input: texts,
                    dimensions: targetDim,
                }),
            });
            const data = await res.json();
            if (data.data) {
                return data.data
                    .sort((a, b) => a.index - b.index)
                    .map((item) => item.embedding);
            }
        } catch (err) {
            console.warn("[Embeddings] OpenAI embedding warning:", err.message);
        }
    }

    // 3. Guaranteed Deterministic Normalized Embeddings Fallback
    return texts.map((t) => generateDeterministicEmbedding(t, targetDim));
}
