
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
        let target = "gemini-2.0-flash";
        if (modelName === "gemini-1.5-pro" || modelName === "gpt-4o") {
            target = "gemini-1.5-pro";
        }
        return googleProvider(target);
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
 * Generates vector embeddings for an array of texts.
 * Uses Gemini (text-embedding-004) or OpenAI (text-embedding-3-small).
 */
export async function embedTexts(texts) {
    if (!texts || texts.length === 0) {
        return [];
    }

    const geminiKey =
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. Try Gemini Embeddings
    if (geminiKey) {
        try {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
            const embeddings = [];

            for (const text of texts) {
                const result = await model.embedContent(text.slice(0, 8000));
                let values = result.embedding.values;

                // Adjust dimension to match Pinecone index dimension
                if (EMBEDDING_DIMENSIONS && values.length !== EMBEDDING_DIMENSIONS) {
                    if (values.length > EMBEDDING_DIMENSIONS) {
                        values = values.slice(0, EMBEDDING_DIMENSIONS);
                    } else {
                        values = [
                            ...values,
                            ...new Array(EMBEDDING_DIMENSIONS - values.length).fill(0),
                        ];
                    }
                }
                embeddings.push(values);
            }
            return embeddings;
        } catch (err) {
            console.warn("[Embeddings] Gemini embedding warning:", err.message);
        }
    }

    // 2. Try OpenAI Embeddings via fetch
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
                    dimensions: EMBEDDING_DIMENSIONS || 1024,
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

    // 3. Fallback pseudo-embeddings if no API key is active
    return texts.map(() => new Array(EMBEDDING_DIMENSIONS || 1024).fill(0.01));
}

