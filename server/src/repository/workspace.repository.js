import prisma from "../lib/db.js";

export const workspaceSelect = {
    id: true,
    title: true,
    description: true,
    icon: true,
    defaultmodel: true,
    createdAt: true,
    updatedAt: true,
};

const normalizeUserId = (userId) => {
    if (typeof userId === "number") return userId;
    const parsed = parseInt(userId, 10);
    return isNaN(parsed) ? 1 : parsed;
};

export function findWorkspacesByUserId(userId) {
    return prisma.workspace.findMany({
        where: { userId: normalizeUserId(userId) },
        select: workspaceSelect,
        orderBy: { updatedAt: "desc" },
    });
}

export function findWorkspaceByIdAndUserId(workspaceId, userId) {
    return prisma.workspace.findFirst({
        where: {
            id: workspaceId,
            userId: normalizeUserId(userId),
        },
        select: workspaceSelect,
    });
}

export function createWorkspaceRecord(userId, data) {
    const { defaultModel, defaultmodel, ...rest } = data;
    return prisma.workspace.create({
        data: {
            userId: normalizeUserId(userId),
            ...rest,
            defaultmodel: defaultmodel || defaultModel || "gpt-4o-mini",
        },
        select: workspaceSelect,
    });
}

export function updateWorkspaceRecord(workspaceId, data) {
    const { defaultModel, defaultmodel, ...rest } = data;
    const updateData = { ...rest };
    if (defaultmodel || defaultModel) {
        updateData.defaultmodel = defaultmodel || defaultModel;
    }

    return prisma.workspace.update({
        where: { id: workspaceId },
        data: updateData,
        select: workspaceSelect,
    });
}

export async function deleteWorkspaceRecord(workspaceId) {
    await prisma.workspace.delete({
        where: { id: workspaceId },
    });
}
