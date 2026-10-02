import { betterAuth } from "better-auth";
import prisma from "./db.js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import "dotenv/config";

const backendUrl =
    process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes(":3000")
        ? process.env.BETTER_AUTH_URL
        : `http://localhost:${process.env.PORT || 3001}`;

const googleClientId =
    (process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLENT_ID || "")
        .replace(/^["']|["']$/g, "")
        .trim();
const googleClientSecret =
    (process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLENT_SECRET || "")
        .replace(/^["']|["']$/g, "")
        .trim();

const googleRedirectURI =
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/callback/google";

// Use an explicit named export
export const auth = betterAuth({
    baseURL: backendUrl,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3005",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3005",
        process.env.CLIENT_URL,
        backendUrl,
    ].filter(Boolean),
    socialProviders: {
        google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            redirectURI: googleRedirectURI,
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            lastname: {
                type: "string",
                required: false,
                defaultValue: "",
            },
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const rawName = (user.name || "").trim();
                    const nameParts = rawName.split(" ");
                    const firstName = nameParts[0] || "User";
                    const lastName = nameParts.slice(1).join(" ") || "";
                    return {
                        data: {
                            ...user,
                            name: user.name ? firstName : "User",
                            lastname: user.lastname || lastName || "",
                        },
                    };
                },
            },
        },
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
});
