import { openai } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { EMBEDDING_DIMENSIONS } from "./ai-config.js";
import "dotenv/config";

const getGeminiKey = () =>
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    "";

const getOpenAIKey = () => process.env.OPENAI_API_KEY?.trim() || "";

const google = createGoogleGenerativeAI({
    apiKey: getGeminiKey(),
});

/**
 * Returns an AI SDK model instance for streaming or structured generation.
 * Automatically chooses Google Gemini or OpenAI based on available API keys and requested model.
 *
 * @param {string} [requestedModel] - Model identifier (e.g. "gemini-2.0-flash", "gpt-4o-mini")
 * @returns {any} AI SDK LanguageModel
 */
export function getLanguageModel(requestedModel = "") {
    const geminiKey = getGeminiKey();
    const openaiKey = getOpenAIKey();

    // 1. If explicitly requested a Gemini model, or only Gemini key is provided
    if (
        requestedModel.toLowerCase().includes("gemini") ||
        (geminiKey && !openaiKey)
    ) {
        if (!geminiKey) {
            throw new Error(
                "GEMINI_API_KEY is not configured in .env. Please set GEMINI_API_KEY.",
            );
        }

        const modelName = requestedModel.toLowerCase().includes("pro")
            ? "gemini-1.5-pro"
            : "gemini-2.0-flash";

        return google(modelName);
    }

    // 2. Otherwise default to OpenAI or whichever key is present
    if (openaiKey) {
        const modelName = requestedModel || "gpt-4o-mini";
        return openai(modelName);
    }

    if (geminiKey) {
        return google("gemini-2.0-flash");
    }

    throw new Error(
        "Neither GEMINI_API_KEY nor OPENAI_API_KEY is configured in .env. Please provide at least one.",
    );
}

/**
 * Embeds an array of texts matching the exact Pinecone index dimension (1024).
 *
 * @param {string[]} texts - Array of string passages to embed
 * @param {number} [targetDimensions=EMBEDDING_DIMENSIONS] - Target vector dimensions (default: 1024)
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
export async function generateEmbeddings(texts, targetDimensions = EMBEDDING_DIMENSIONS) {
    if (!texts || texts.length === 0) {
        return [];
    }

    const openaiKey = getOpenAIKey();
    const geminiKey = getGeminiKey();

    // 1. Try OpenAI if key is present
    if (openaiKey) {
        const { default: OpenAI } = await import("openai");
        const client = new OpenAI({ apiKey: openaiKey });

        const response = await client.embeddings.create({
            model: "text-embedding-3-small",
            input: texts,
            dimensions: targetDimensions,
        });

        return response.data
            .sort((a, b) => a.index - b.index)
            .map((item) => item.embedding);
    }

    // 2. Try Google Gemini embedding
    if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        const results = await Promise.all(
            texts.map(async (text) => {
                const res = await model.embedContent(text);
                const values = res.embedding.values; // 768 dimensions

                if (values.length === targetDimensions) {
                    return values;
                }

                // Adjust to match target dimensions (e.g. 1024)
                if (values.length < targetDimensions) {
                    const padded = new Array(targetDimensions).fill(0);
                    for (let i = 0; i < values.length; i++) {
                        padded[i] = values[i];
                    }
                    return padded;
                }

                return values.slice(0, targetDimensions);
            }),
        );

        return results;
    }

    throw new Error(
        "Please provide GEMINI_API_KEY or OPENAI_API_KEY in server/.env to generate embeddings.",
    );
}
