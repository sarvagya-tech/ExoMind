import prisma from "../lib/db.js";

export const artifactSelect = {
    id: true,
    workspaceId: true,
    type: true,
    title: true,
    content: true,
    sourceIds: true,
    status: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
};

export function findArtifactsByWorkspaceId(workspaceId) {
    return prisma.learningArtifact.findMany({
        where: { workspaceId },
        select: artifactSelect,
        orderBy: { createdAt: "desc" },
    });
}

export function findArtifactByIdAndWorkspaceId(
    artifactId,
    workspaceId,
) {
    return prisma.learningArtifact.findFirst({
        where: { id: artifactId, workspaceId },
        select: artifactSelect,
    });
}

export function createArtifactRecord(data) {
    return prisma.learningArtifact.create({
        data: {
            workspaceId: data.workspaceId,
            type: data.type,
            title: data.title,
            sourceIds: data.sourceIds,
            status: data.status ?? "PENDING",
            metadata: data.metadata,
        },
        select: artifactSelect,
    });
}

export function updateArtifactRecord(
    artifactId,
    data,
) {
    return prisma.learningArtifact.update({
        where: { id: artifactId },
        data,
        select: artifactSelect,
    });
}

export async function deleteArtifactRecord(artifactId) {
    await prisma.learningArtifact.delete({
        where: { id: artifactId },
    });
}

export function findArtifactById(artifactId) {
    return prisma.learningArtifact.findUnique({
        where: { id: artifactId },
        select: artifactSelect,
    });
}
