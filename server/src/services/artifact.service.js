import { enqueueArtifactGeneration } from "../lib/artifact-events.js";
import {
    createArtifactRecord,
    deleteArtifactRecord,
    findArtifactById,
    findArtifactByIdAndWorkspaceId,
    findArtifactsByWorkspaceId,
    updateArtifactRecord,
} from "../repository/artifact.repository.js";
import { NotFoundError } from "../types/app-error.js";
import {
    gatherSourceContext,
    generateArtifactContent,
} from "./artifact-generation.services.js";
import { getWorkspaceByIdForUser } from "./workspace.services.js";

/**
 * Lists all learning artifacts in a workspace.
 *
 * @param {string} workspaceId - Workspace to list artifacts from
 * @param {string} userId - Authenticated user's id
 * @returns {Promise<Array>} Artifact records ordered by creation time
 */
export async function listArtifactsForWorkspace(
    workspaceId,
    userId,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    return findArtifactsByWorkspaceId(workspaceId);
}

/**
 * Loads a single artifact after verifying workspace ownership.
 *
 * @param {string} workspaceId - Workspace the artifact belongs to
 * @param {string} artifactId - Artifact to fetch
 * @param {string} userId - Authenticated user's id
 * @returns {Promise<Object>} Artifact record with content when status is `READY`
 * @throws {NotFoundError} When the artifact does not exist in this workspace
 */
export async function getArtifactForWorkspace(
    workspaceId,
    artifactId,
    userId,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    const artifact = await findArtifactByIdAndWorkspaceId(
        artifactId,
        workspaceId,
    );

    if (!artifact) {
        throw new NotFoundError("Artifact not found");
    }

    return artifact;
}

/**
 * Creates a pending artifact and enqueues background generation via Inngest.
 *
 * Validates that ready sources exist before creating the row. The actual AI
 * generation runs asynchronously in {@link processArtifactById}.
 *
 * @param {string} workspaceId - Workspace to attach the artifact to
 * @param {string} userId - Authenticated user's id
 * @param {Object} input - Artifact type, optional title, optional source id filter
 * @returns {Promise<Object>} New artifact with status `PENDING`
 * @throws {ValidationError} When no ready sources are available
 */
export async function createArtifactForWorkspace(
    workspaceId,
    userId,
    input,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    const context = await gatherSourceContext(
        workspaceId,
        input.sourceIds,
    );

    const artifact = await createArtifactRecord({
        workspaceId,
        type: input.type,
        title:
            input.title ||
            `${
                {
                    SUMMARY: "Summary",
                    TAKEAWAYS: "Key Takeaways",
                    FLASHCARDS: "Flashcards",
                    QUIZ: "Quiz",
                    MINDMAP: "Mind Map",
                    REPORT: "AI Report",
                }[input.type]
            } · ${new Date().toLocaleDateString()}`,
        sourceIds: context.sourceIds,
        status: "PENDING",
    });

    await enqueueArtifactGeneration({
        artifactId: artifact.id,
        workspaceId,
    });

    return artifact;
}

/**
 * Deletes an artifact from the workspace.
 *
 * @param {string} workspaceId - Workspace the artifact belongs to
 * @param {string} artifactId - Artifact to delete
 * @param {string} userId - Authenticated user's id
 * @returns {Promise<void>} Resolves when the artifact row is deleted
 * @throws {NotFoundError} When the artifact is not found
 */
export async function deleteArtifactForWorkspace(
    workspaceId,
    artifactId,
    userId,
) {
    await getArtifactForWorkspace(workspaceId, artifactId, userId);
    await deleteArtifactRecord(artifactId);
}

/**
 * Runs the full artifact generation pipeline (used by Inngest worker).
 *
 * ```
 * status: PROCESSING
 *   → gatherSourceContext
 *   → generateArtifactContent
 *   → status: READY (or FAILED on error)
 * ```
 *
 * @param {string} artifactId - Artifact to generate content for
 * @returns {Promise<Object>} Updated artifact with `READY` status and generated content
 * @throws {Error} When the artifact is missing or generation fails (status set to `FAILED`)
 */
export async function processArtifactById(artifactId) {
    const artifact = await findArtifactById(artifactId);
    if (!artifact) {
        throw new Error("Artifact not found");
    }

    await updateArtifactRecord(artifactId, { status: "PROCESSING" });

    try {
        const context = await gatherSourceContext(
            artifact.workspaceId,
            artifact.sourceIds,
        );

        const content = await generateArtifactContent(
            artifact.type,
            context.text,
        );

        return updateArtifactRecord(artifactId, {
            status: "READY",
            content: content,
            metadata: {
                generatedAt: new Date().toISOString(),
                processingError: undefined,
            },
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Artifact generation failed";

        await updateArtifactRecord(artifactId, {
            status: "FAILED",
            metadata: {
                processingError: message,
            },
        });

        throw error;
    }
}
