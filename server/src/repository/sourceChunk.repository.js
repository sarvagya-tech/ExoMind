import prisma from "../lib/db.js";

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
  return prisma.sourceChunk.deleteMany({
    where: { sourceId },
  });
}

export async function createSourceChunks(chunks) {
  if (chunks.length === 0) {
    return [];
  }

  const data = chunks.map((chunk) => ({
    sourceId: chunk.sourceId,
    index: chunk.index,
    content: chunk.content,
    tokenCount: chunk.tokenCount ?? null,
    metadata: chunk.metadata ?? {},
  }));

  await prisma.sourceChunk.createMany({
    data,
    skipDuplicates: true,
  });

  return prisma.sourceChunk.findMany({
    where: { sourceId: chunks[0].sourceId },
    select: sourceChunkSelect,
    orderBy: { index: "asc" },
  });
}


export function findChunksBySourceId(sourceId) {
  return prisma.sourceChunk.findMany({
    where: { sourceId },
    select: sourceChunkSelect,
    orderBy: { index: "asc" },
  });
}
