import { uploadPdfToCloudinary } from "../lib/cloudinary.js";
import { scrapeWebsite } from "../lib/firecrawl.js";
import { fetchYoutubeTranscript } from "../lib/youtube.js";
import {
    createSourceRecord,
    updateSourceRecord,
    findSourceById,
    findSourcesByWorkspaceId,
    findSourceByIdAndWorkspaceId,
    deleteSourceRecord,
} from "../repository/source.repository.js";
import { NotFoundError } from "../utils/app.error.js";
import { getWorkspaceByIdForUser } from "./workspace.services.js";

const assertsWorkspaceAccess = async (workspaceId, userId) => {
    await getWorkspaceByIdForUser({ workspaceId, userId });
};

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
    await deleteSourceRecord(sourceId);
};

const bulkDeleteSourcesForWorkspace = async (workspaceId, sourceIds, userId) => {
    await assertsWorkspaceAccess(workspaceId, userId);
    for (const sourceId of sourceIds) {
        try {
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

    const websiteSource = await createSourceRecord({
        workspaceId,
        title: data.title || scraped.title || data.url,
        type: "WEBSITE",
        content: scraped.markdown || "",
        url: data.url,
        status: "READY",
        metadata: {
            importedFrom: data.url,
        },
    });
    return websiteSource;
};

const uploadPdfSource = async (workspaceId, userId, file, title) => {
    await assertsWorkspaceAccess(workspaceId, userId);
    let fileUrl = "";
    let publicId = "";

    try {
        const upload = await uploadPdfToCloudinary(file.buffer, file.originalname);
        fileUrl = upload.secureUrl;
        publicId = upload.publicId;
    } catch (e) {
        console.warn("Cloudinary upload fallback:", e.message);
    }

    return createSourceRecord({
        workspaceId,
        type: "PDF",
        title: title?.trim() || file.originalname.replace(/\.pdf$/i, ""),
        content: "",
        status: "READY",
        metadata: {
            fileUrl,
            fileName: file.originalname,
            fileSize: file.size || file.buffer?.length,
            publicId,
        },
    });
};

const importYoutubeSource = async (workspaceId, userId, input) => {
    await assertsWorkspaceAccess(workspaceId, userId);
    let transcript = { content: "", videoId: "" };
    try {
        transcript = await fetchYoutubeTranscript(input.url);
    } catch (e) {
        console.warn("YouTube transcript fallback:", e.message);
    }

    const source = await createSourceRecord({
        workspaceId,
        title: input.title || `YouTube: ${transcript.videoId || input.url}`,
        content: transcript.content || "",
        url: input.url,
        status: "READY",
        metadata: {
            videoId: transcript.videoId,
        },
    });
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
};
