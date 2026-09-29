
import { v2 as cloudinary } from "cloudinary";
import { ValidationError } from "../types/app-error.js";

function getCloudinaryConfig() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (cloudName && apiKey && apiSecret) {
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });
    }

    return { cloudName, apiKey, apiSecret, uploadPreset };
}

// Generate a signed Cloudinary download URL
export function getSignedCloudinaryDownloadUrl(
    publicId,
    resourceType = "raw",
) {
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    if (!cloudName || !apiKey || !apiSecret) {
        return null;
    }

    return cloudinary.url(publicId, {
        resource_type: resourceType,
        type: "upload",
        sign_url: true,
        secure: true,
    });
}

// Upload a PDF buffer to Cloudinary
export async function uploadPdfToCloudinary(
    buffer,
    filename,
) {
    const { cloudName, apiKey, apiSecret, uploadPreset } = getCloudinaryConfig();

    if (!cloudName) {
        throw new ValidationError(
            "Cloudinary is not configured on the server"
        );
    }

    // 1. If API Key and API Secret exist, use direct signed upload stream (authenticated & reliable)
    if (apiKey && apiSecret) {
        return new Promise((resolve, reject) => {
            const cleanName = (filename || "document.pdf")
                .replace(/\.pdf$/i, "")
                .replace(/[^a-zA-Z0-9_-]/g, "_");
            const publicId = `${cleanName}_${Date.now()}`;

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw",
                    folder: "notebook/pdfs",
                    public_id: publicId,
                    use_filename: true,
                },
                (error, result) => {
                    if (error) {
                        reject(new ValidationError(error.message || "Cloudinary upload failed"));
                    } else {
                        resolve({
                            secureUrl: result.secure_url,
                            publicId: result.public_id,
                            bytes: result.bytes,
                            originalFilename: filename,
                            resourceType: result.resource_type || "raw",
                        });
                    }
                }
            );

            const bufferData = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
            uploadStream.end(bufferData);
        });
    }

    // 2. Fallback to unsigned HTTP upload if API Key or Secret are omitted
    if (!uploadPreset) {
        throw new ValidationError(
            "Cloudinary requires either CLOUDINARY_API_KEY/SECRET or CLOUDINARY_UPLOAD_PRESET in server/.env"
        );
    }

    const form = new FormData();
    form.append(
        "file",
        new Blob([new Uint8Array(buffer)], { type: "application/pdf" }),
        filename,
    );
    form.append("upload_preset", uploadPreset);
    form.append("folder", "notebook/pdfs");

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
            method: "POST",
            body: form,
        },
    );

    const result = await response.json();

    if (!response.ok) {
        const message =
            result.error?.message ??
            `Cloudinary upload failed (${response.status})`;
        throw new ValidationError(message);
    }

    return {
        secureUrl: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        originalFilename: filename,
        resourceType: result.resource_type === "image" ? "image" : "raw",
    };
}

