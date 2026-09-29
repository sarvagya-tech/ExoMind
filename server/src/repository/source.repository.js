import prisma from "../lib/db.js";

export const sourceSelect = {
    id: true,
    workspaceId: true,
    type: true,
    title: true,
    content: true,
    url: true,
    status: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
};

const createSourceRecord = (data) => {
    return prisma.source.create({
        data: {
            workspaceId: data.workspaceId,
            type: data.type,
            title: data.title,
            content: data.content ?? null,
            url: data.url ?? null,
            status: data.status ?? "PENDING",
            metadata: data.metadata ?? {},
        },
        select: sourceSelect,
    });
};

const findSourcesByWorkspaceId = (workspaceId) => {
    return prisma.source.findMany({
        where: { workspaceId },
        select: sourceSelect,
        orderBy: { createdAt: "desc" },
    });
};

const findSourceByIdAndWorkspaceId = (workspaceId, sourceId) => {
    return prisma.source.findFirst({
        where: {
            id: sourceId,
            workspaceId,
        },
        select: sourceSelect,
    });
};

const deleteSourceRecord = (sourceId) => {
    return prisma.source.delete({
        where: {
            id: sourceId,
        },
    });
};

const findSourceById = (sourceId) => {
    return prisma.source.findUnique({
        where: {
            id: sourceId,
        },
        select: sourceSelect,
    });
};

const updateSourceRecord = (sourceId, data) => {
    return prisma.source.update({
        where: {
            id: sourceId,
        },
        data,
        select: sourceSelect,
    });
};

export {
    createSourceRecord,
    findSourcesByWorkspaceId,
    updateSourceRecord,
    findSourceById,
    deleteSourceRecord,
    findSourceByIdAndWorkspaceId,
};
