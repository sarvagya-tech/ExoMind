import { generateEmbeddings } from "./ai-provider.js";

/**
 * Generate embeddings for multiple texts using available AI provider (Gemini or OpenAI).
 *
 * @param {string[]} texts - Array of string passages to embed
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
export async function embedTexts(texts) {
    return generateEmbeddings(texts);
}
