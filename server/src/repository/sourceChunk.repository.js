
export const sourceChunkSelect = {
    id: true,
    sourceId: true,
    index: true,
    content: true,
    tokenCount: true,
    metadata: true,
    createdAt: true,
};

export function deleteChunksBySourceId(sourceId) {
    return Promise.resolve({ count: 0 });
}

export function createSourceChunks(chunks) {
    if (!chunks || chunks.length === 0) {
        return Promise.resolve([]);
    }
    return Promise.resolve(chunks);
}

export function findChunksBySourceId(sourceId) {
    return Promise.resolve([]);
}

