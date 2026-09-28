import { MemoryClient } from "mem0ai";

let client = null;

/**
 * Returns a singleton Mem0 API client.
 *
 * @returns {MemoryClient} Configured `MemoryClient`
 * @throws {Error} When `MEM0_API_KEY` is missing
 */
export function getMem0Client() {
    const apiKey = process.env.MEM0_API_KEY?.trim();

    if (!apiKey) {
        throw new Error("MEM0_API_KEY is not configured");
    }

    if (!client) {
        client = new MemoryClient({ apiKey });
    }

    return client;
}

/**
 * Maps a raw Mem0 record into the app's memory shape.
 *
 * @param {Object} record - Raw Mem0 memory object
 * @returns {Object} Normalized memory with `source` derived from metadata
 */
function mapMemory(record) {
    const metadata = record.metadata ?? null;
    const source = metadata?.source === "manual" ? "manual" : "learned";
    const createdAt = record.createdAt ?? new Date().toISOString();
    const updatedAt = record.updatedAt ?? createdAt;

    return {
        id: record.id,
        memory: record.memory ?? "",
        createdAt:
            createdAt instanceof Date ? createdAt.toISOString() : createdAt,
        updatedAt:
            updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt,
        metadata,
        categories: record.categories,
        source,
    };
}

/**
 * Lists all memories stored for a user (up to 100).
 *
 * @param {string} userId - Authenticated user's id
 * @returns {Promise<Array>} Array of memories, or `[]` when Mem0 is not configured
 */
export async function listUserMemories(userId) {
    if (!process.env.MEM0_API_KEY?.trim()) {
        return [];
    }

    const page = await getMem0Client().getAll({
        filters: { user_id: userId },
        page: 1,
        pageSize: 100,
    });

    return page.results.map(mapMemory);
}

/**
 * Semantic search over a user's memories for RAG chat context.
 *
 * @param {string} userId - Authenticated user's id
 * @param {string} query - Current user message or search text
 * @returns {Promise<Array>} Top matching memories (up to 8), or `[]` when Mem0 is off or query is empty
 */
export async function searchUserMemories(userId, query) {
    if (!process.env.MEM0_API_KEY?.trim() || !query.trim()) {
        return [];
    }

    const results = await getMem0Client().search(query, {
        filters: { user_id: userId },
        topK: 8,
        threshold: 0.1,
    });

    return results.results.map(mapMemory);
}

/**
 * Creates a single user memory (manual or explicit text).
 *
 * @param {string} userId - Owner of the memory
 * @param {Object} input - Memory text, optional infer flag, optional metadata
 * @returns {Promise<Object>} Created memory record
 * @throws {Error} When Mem0 returns no created record
 */
export async function addUserMemory(
    userId,
    input,
) {
    const created = await getMem0Client().add(
        [{ role: "user", content: input.memory }],
        {
            userId,
            infer: input.infer ?? false,
            metadata: input.metadata,
        },
    );

    const first = created[0];
    if (!first) {
        throw new Error("Mem0 did not return a created memory");
    }

    return mapMemory(first);
}

/**
 * Extracts inferred memories from a conversation transcript (fire-and-forget in chat).
 *
 * @param {string} userId - Owner of extracted memories
 * @param {Array} messages - Recent user/assistant turns
 * @param {Object} [metadata] - Optional metadata (e.g. `{ source: "learned", conversationId }`)
 * @returns {Promise<void>} Resolves immediately when Mem0 is off or messages are empty
 */
export async function addMemoriesFromMessages(
    userId,
    messages,
    metadata,
) {
    if (!process.env.MEM0_API_KEY?.trim() || messages.length === 0) {
        return;
    }

    await getMem0Client().add(messages, {
        userId,
        infer: true,
        metadata,
    });
}

/**
 * Updates the text of an existing memory by id.
 *
 * @param {string} memoryId - Mem0 memory id
 * @param {Object} input - New memory text
 * @returns {Promise<Object>} Updated memory record
 * @throws {Error} When Mem0 returns no updated record
 */
export async function updateUserMemory(
    memoryId,
    input,
) {
    const updated = await getMem0Client().update(memoryId, {
        text: input.memory,
    });

    const first = updated[0];
    if (!first) {
        throw new Error("Mem0 did not return an updated memory");
    }

    return mapMemory(first);
}

/**
 * Permanently deletes a memory from Mem0.
 *
 * @param {string} memoryId - Mem0 memory id to delete
 * @returns {Promise<void>} Resolves when deletion completes
 */
export async function deleteUserMemory(memoryId) {
    await getMem0Client().delete(memoryId);
}
