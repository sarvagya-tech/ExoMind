import { uploadPdfToCloudinary } from "../lib/cloudinary.js";
import { scrapeWebsite } from "../lib/firecrawl.js";
import { fetchYoutubeTranscript } from "../lib/youtube.js";
import { extractPdfFromBuffer, extractPdfFromCloudinary } from "../lib/pdf.js";
import {
    createSourceRecord,
    updateSourceRecord,
    findSourceById,
    findSourcesByWorkspaceId,
    findSourceByIdAndWorkspaceId,
    deleteSourceRecord,
} from "../repository/source.repository.js";
import {
    chunkSourceContent,
    embedAndIndexSource,
    removeSourceFromIndex,
} from "./source-processing.services.js";
import { enqueueSourceProcessing } from "../lib/source-events.js";
import { NotFoundError } from "../utils/app.error.js";
import { getWorkspaceByIdForUser } from "./workspace.services.js";

const assertsWorkspaceAccess = async (workspaceId, userId) => {
    await getWorkspaceByIdForUser({ workspaceId, userId });
};

/**
 * Asynchronously chunk and index source content into Pinecone
 */
async function autoIndexSource(source, text, pages) {
    if (!text || !text.trim()) return;
    try {
        const chunks = await chunkSourceContent(source.id, text, pages);
        await embedAndIndexSource(source, chunks);
        console.log(`[Pinecone/Chunking] Successfully indexed ${chunks.length} chunks for source ${source.id}`);
    } catch (err) {
        console.warn(`[Pinecone/Chunking] Auto-indexing warning for source ${source.id}:`, err.message);
    }
}


const listSourcesForWorkspace = async (workspaceId, userId, filters) => {
    await assertsWorkspaceAccess(workspaceId, userId);
    const sources = await findSourcesByWorkspaceId(workspaceId);
    return sources;
};

const getSourceForWorkspace = async (workspaceId, sourceId, userId) => {
    await assertsWorkspaceAccess(workspaceId, userId);
    const source = await findSourceByIdAndWorkspaceId(workspaceId, sourceId);
    if (!source) {
        throw new NotFoundError("Source not found");
    }

    // Lazy extract PDF content if it was not extracted at upload time
    if (source.type === "PDF" && (!source.content || !source.content.trim())) {
        try {
            const metadata = source.metadata || {};
            if (metadata.fileUrl) {
                const extracted = await extractPdfFromCloudinary({
                    fileUrl: metadata.fileUrl,
                    publicId: metadata.publicId,
                    resourceType: metadata.resourceType || "raw",
                });
                if (extracted && extracted.text) {
                    source.content = extracted.text;
                    await updateSourceRecord(source.id, {
                        content: extracted.text,
                        metadata: {
                            ...metadata,
                            pageCount: extracted.pageCount || metadata.pageCount,
                        },
                    });
                    void autoIndexSource(source, extracted.text, extracted.pages);
                }
            }
        } catch (err) {
            console.warn("Lazy PDF extraction warning:", err.message);
        }
    }

    return source;
};

const deleteSourceForWorkspace = async (workspaceId, sourceId, userId) => {
    await assertsWorkspaceAccess(workspaceId, userId);
    await removeSourceFromIndex(workspaceId, sourceId).catch(() => null);
    await deleteSourceRecord(sourceId);
};

const bulkDeleteSourcesForWorkspace = async (workspaceId, sourceIds, userId) => {
    await assertsWorkspaceAccess(workspaceId, userId);
    for (const sourceId of sourceIds) {
        try {
            await removeSourceFromIndex(workspaceId, sourceId).catch(() => null);
            await deleteSourceRecord(sourceId);
        } catch { }
    }
};

const createTextOrMarkdownSource = async (workspaceId, userId, data) => {
    await assertsWorkspaceAccess(workspaceId, userId);
    const source = await createSourceRecord({
        workspaceId,
        title: data.title || "Pasted Note",
        type: data.type || "TEXT",
        content: data.content,
        status: "READY",
        metadata: {
            createdManually: true,
        },
    });

    if (data.content) {
        void autoIndexSource(source, data.content);
    }
    void enqueueSourceProcessing(source.id, workspaceId);

    return source;
};

const importWebsiteSource = async (workspaceId, userId, data) => {
    await assertsWorkspaceAccess(workspaceId, userId);
    let scraped = { markdown: "", title: data.title, sourceUrl: data.url };
    try {
        scraped = await scrapeWebsite(data.url);
    } catch (e) {
        console.warn("Firecrawl scrape fallback:", e.message);
    }

    const content = scraped.markdown || "";
    const websiteSource = await createSourceRecord({
        workspaceId,
        title: data.title || scraped.title || data.url,
        type: "WEBSITE",
        content,
        url: data.url,
        status: "READY",
        metadata: {
            importedFrom: data.url,
        },
    });

    if (content) {
        void autoIndexSource(websiteSource, content);
    }
    void enqueueSourceProcessing(websiteSource.id, workspaceId);

    return websiteSource;
};

const uploadPdfSource = async (workspaceId, userId, file, title) => {
    await assertsWorkspaceAccess(workspaceId, userId);
    let fileUrl = "";
    let publicId = "";
    let extractedText = "";
    let pageCount = 1;
    let pages = [];

    // 1. Extract markdown content directly from the PDF buffer
    try {
        if (file.buffer) {
            const extracted = await extractPdfFromBuffer(file.buffer);
            extractedText = extracted.text;
            pageCount = extracted.pageCount;
            pages = extracted.pages;
        }
    } catch (e) {
        console.warn("Direct PDF buffer extraction warning:", e.message);
    }

    // 2. Upload to Cloudinary for permanent storage
    try {
        const upload = await uploadPdfToCloudinary(file.buffer, file.originalname);
        fileUrl = upload.secureUrl;
        publicId = upload.publicId;
    } catch (e) {
        console.warn("Cloudinary upload fallback:", e.message);
    }

    // 3. Create the source record with extracted markdown content
    const pdfSource = await createSourceRecord({
        workspaceId,
        type: "PDF",
        title: title?.trim() || file.originalname.replace(/\.pdf$/i, ""),
        content: extractedText,
        status: "READY",
        metadata: {
            fileUrl,
            fileName: file.originalname,
            fileSize: file.size || file.buffer?.length,
            publicId,
            pageCount,
            resourceType: "raw",
        },
    });

    // 4. Automatically index chunks in Pinecone for chat RAG
    if (extractedText) {
        void autoIndexSource(pdfSource, extractedText, pages);
    }
    void enqueueSourceProcessing(pdfSource.id, workspaceId);

    return pdfSource;
};

const importYoutubeSource = async (workspaceId, userId, input) => {
    await assertsWorkspaceAccess(workspaceId, userId);
    let transcript = { content: "", videoId: "" };
    try {
        transcript = await fetchYoutubeTranscript(input.url);
    } catch (e) {
        console.warn("YouTube transcript fallback:", e.message);
    }

    const content = transcript.content || "";
    const source = await createSourceRecord({
        workspaceId,
        title: input.title || `YouTube: ${transcript.videoId || input.url}`,
        content,
        url: input.url,
        status: "READY",
        metadata: {
            videoId: transcript.videoId,
        },
    });

    if (content) {
        void autoIndexSource(source, content);
    }
    void enqueueSourceProcessing(source.id, workspaceId);

    return source;
};


export {
    importYoutubeSource,
    uploadPdfSource,
    importWebsiteSource,
    createTextOrMarkdownSource,
    bulkDeleteSourcesForWorkspace,
    getSourceForWorkspace,
    listSourcesForWorkspace,
    deleteSourceForWorkspace,
    autoIndexSource,
};

