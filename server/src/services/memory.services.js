import {
    addUserMemory,
    updateUserMemory,
} from "../lib/mem0.js";

/**
 * Creates a user-authored memory (not inferred by Mem0).
 *
 * @param {string} userId - Owner of the memory
 * @param {Object} input - Raw memory text from the client
 * @returns {Promise<Object>} Created Mem0 memory record
 * @throws {ValidationError} When memory text is empty after trimming
 */
export function createMemoryForUser(
    userId,
    input,
) {
    return addUserMemory(userId, {
        memory: input.memory,
        infer: false,
        metadata: { source: "manual" },
    });
}

/**
 * Updates the text of an existing memory by id.
 *
 * @param {string} _userId - Reserved for future ownership checks
 * @param {string} memoryId - Mem0 memory id to update
 * @param {Object} input - New memory text
 * @returns {Promise<Object>} Updated Mem0 memory record
 * @throws {ValidationError} When memory is missing or empty
 */
export function updateMemoryForUser(
    _userId,
    memoryId,
    input,
) {
    return updateUserMemory(memoryId, input);
}
