import { uploadPdfToCloudinary } from "../lib/cloudinary.js";
import { scrapeWebsite } from "../lib/firecrawl.js";
import { fetchYoutubeTranscript } from "../lib/youtube.js";
import { extractPdfFromBuffer } from "../lib/pdf.js";
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
        } catch {}
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

    // Automatically chunk and index in Pinecone
    void autoIndexSource(source, data.content);

    return source;
};

const importWebsiteSource = async (workspaceId, userId, data) => {
    await assertsWorkspaceAccess(workspaceId, userId);
    let scraped = { markdown: "", title: data.title, sourceUrl: data.url };
    try {
        scraped = await scrapeWebsite(data.url);
    } catch (e) {
        console.warn("Firecrawl scrape warning:", e.message);
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

    // Automatically chunk and index in Pinecone
    if (content) {
        void autoIndexSource(websiteSource, content);
    }

    return websiteSource;
};

const uploadPdfSource = async (workspaceId, userId, file, title) => {
    await assertsWorkspaceAccess(workspaceId, userId);
    let fileUrl = "";
    let publicId = "";
    let extractedText = "";
    let pageCount = 1;
    let pages = [];

    // 1. Immediately extract text from the file buffer using unpdf
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

    // 2. Upload file to Cloudinary for permanent hosting
    try {
        const upload = await uploadPdfToCloudinary(file.buffer, file.originalname);
        fileUrl = upload.secureUrl;
        publicId = upload.publicId;
    } catch (e) {
        console.warn("Cloudinary upload warning:", e.message);
    }

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
        },
    });

    // 3. Automatically chunk and index into Pinecone
    if (extractedText) {
        void autoIndexSource(pdfSource, extractedText, pages);
    }

    return pdfSource;
};

const importYoutubeSource = async (workspaceId, userId, input) => {
    await assertsWorkspaceAccess(workspaceId, userId);
    let transcript = { content: "", videoId: "" };
    try {
        transcript = await fetchYoutubeTranscript(input.url);
    } catch (e) {
        console.warn("YouTube transcript warning:", e.message);
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

    // Automatically chunk and index into Pinecone
    if (content) {
        void autoIndexSource(source, content);
    }

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
