import { inngest } from "../inngest/client.js";

/**
 * Enqueues an artifact generation job to run asynchronously via Inngest.
 *
 * @param {Object} input - { artifactId, userId }
 * @returns {Promise<void>} Resolves when the event is accepted by Inngest
 */
export async function enqueueArtifactGeneration(input) {
    try {
        await inngest.send({
            name: "artifact/generate",
            data: input,
        });
    } catch (err) {
        console.warn("[Inngest] Could not enqueue artifact generation:", err.message);
    }
}
