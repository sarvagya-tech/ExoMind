import { Pinecone } from "@pinecone-database/pinecone";
import { EMBEDDING_DIMENSIONS } from "./ai-config.js";
import "dotenv/config";

const indexName = process.env.PINECONE_INDEX || "notebook";

let pineconeClient = null;
let indexReady = false;

/**
 * Returns singleton Pinecone client.
 */
export function getPineconeClient() {
    if (!process.env.PINECONE_API_KEY) {
        throw new Error("PINECONE_API_KEY is not configured in server/.env");
    }

    if (!pineconeClient) {
        pineconeClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
    }

    return pineconeClient;
}

/**
 * Ensures the Pinecone index exists and is ready.
 */
export async function ensurePineconeIndex() {
    if (indexReady) {
        return;
    }

    const client = getPineconeClient();

    try {
        const indexes = await client.listIndexes();
        const exists = indexes.indexes?.some((idx) => idx.name === indexName);

        if (!exists) {
            console.log(`[Pinecone] Creating index "${indexName}" with dimension ${EMBEDDING_DIMENSIONS}...`);
            await client.createIndex({
                name: indexName,
                dimension: EMBEDDING_DIMENSIONS,
                metric: "cosine",
                spec: {
                    serverless: {
                        cloud: "aws",
                        region: "us-east-1",
                    },
                },
            });

            // Wait for index to transition to Ready
            for (let i = 0; i < 30; i++) {
                const desc = await client.describeIndex(indexName);
                if (desc.status?.ready) break;
                await new Promise((r) => setTimeout(r, 2000));
            }
        }

        indexReady = true;
    } catch (err) {
        console.warn(`[Pinecone] ensurePineconeIndex warning:`, err.message);
        indexReady = true;
    }
}

/**
 * Returns Pinecone index handle for the configured index.
 */
export async function getPineconeIndex() {
    await ensurePineconeIndex();
    const client = getPineconeClient();
    return client.index(indexName);
}

/**
 * Upsert records into workspace namespace.
 */
export async function upsertSourceVectors(workspaceId, records) {
    if (!records || records.length === 0) {
        return;
    }

    const index = await getPineconeIndex();
    const namespace = index.namespace(workspaceId);

    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        await namespace.upsert({
            records: batch,
        });
    }
}

/**
 * Delete vectors belonging to a source from workspace namespace.
 */
export async function deleteSourceVectors(workspaceId, sourceId) {
    try {
        const index = await getPineconeIndex();
        await index.namespace(workspaceId).deleteMany({
            filter: {
                sourceId: {
                    $eq: sourceId,
                },
            },
        });
    } catch (err) {
        console.warn(`[Pinecone] deleteSourceVectors warning:`, err.message);
    }
}

/**
 * Delete all vectors in a workspace namespace.
 */
export async function deleteWorkspaceVectors(workspaceId) {
    try {
        const index = await getPineconeIndex();
        await index.namespace(workspaceId).deleteAll();
    } catch (err) {
        console.warn(`[Pinecone] deleteWorkspaceVectors warning:`, err.message);
    }
}

/**
 * Query top matching vectors from workspace namespace.
 */
export async function queryWorkspaceVectors(workspaceId, vector, topK = 6) {
    try {
        const index = await getPineconeIndex();
        const result = await index.namespace(workspaceId).query({
            vector,
            topK,
            includeMetadata: true,
        });

        return result.matches || [];
    } catch (err) {
        console.warn(`[Pinecone] queryWorkspaceVectors error:`, err.message);
        return [];
    }
}

export { indexName as PINECONE_INDEX_NAME };
