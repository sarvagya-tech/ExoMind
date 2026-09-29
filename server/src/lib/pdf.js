
import { extractText, getDocumentProxy } from "unpdf";
import { getSignedCloudinaryDownloadUrl } from "./cloudinary.js";

const downloadPdf = async (url) => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`failed to download the pdf (${response.status})`);
    }
    return response.arrayBuffer();
};

export const extractPdfFromBuffer = async (buffer) => {
    if (!buffer) {
        throw new Error("No PDF buffer provided");
    }

    let uint8Array;
    if (Buffer.isBuffer(buffer)) {
        uint8Array = new Uint8Array(
            buffer.buffer.slice(
                buffer.byteOffset,
                buffer.byteOffset + buffer.byteLength,
            ),
        );
    } else if (buffer instanceof ArrayBuffer) {
        uint8Array = new Uint8Array(buffer);
    } else if (buffer instanceof Uint8Array) {
        uint8Array = new Uint8Array(
            buffer.buffer.slice(
                buffer.byteOffset,
                buffer.byteOffset + buffer.byteLength,
            ),
        );
    } else {
        const buf = Buffer.from(buffer);
        uint8Array = new Uint8Array(
            buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
        );
    }

    const { totalPages, text } = await extractText(uint8Array, {
        mergePages: false,
    });

    const pages = Array.isArray(text)
        ? text.map((page) => String(page || "").trim())
        : [String(text || "").trim()];

    // Format into clean Markdown content with Page headings if multi-page
    let markdown = "";
    if (pages.length > 1) {
        markdown = pages
            .map((pageContent, idx) => `## Page ${idx + 1}\n\n${pageContent}`)
            .filter((p) => p.trim())
            .join("\n\n---\n\n");
    } else {
        markdown = pages[0] || "";
    }

    if (!markdown.trim()) {
        markdown = "*(No readable text could be extracted from this PDF document)*";
    }

    return {
        text: markdown,
        pages,
        pageCount: totalPages || pages.length || 1,
    };
};

export async function extractPdfFromCloudinary(input) {
    try {
        const buffer = await downloadPdf(input.fileUrl);
        return await extractPdfFromBuffer(buffer);
    } catch (error) {
        const isUnauthorized =
            error instanceof Error && error.message.includes("(401)");

        if (!isUnauthorized || !input.publicId) {
            throw error;
        }

        const signedUrl = getSignedCloudinaryDownloadUrl(
            input.publicId,
            input.resourceType ?? "raw",
        );

        if (!signedUrl) {
            throw new Error(
                "PDF download requires authentication. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to server/.env, or re-upload the PDF.",
            );
        }

        const buffer2 = await downloadPdf(signedUrl);
        return extractPdfFromBuffer(buffer2);
    }
}




