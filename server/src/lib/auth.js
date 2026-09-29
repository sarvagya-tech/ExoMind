import { betterAuth } from "better-auth";
import prisma from "./db.js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import "dotenv/config";

const backendUrl = process.env.BETTER_AUTH_URL || "http://localhost:3001";
const clientUrl = process.env.CLIENT_URL || "http://localhost:3005";

export const auth = betterAuth({
    baseURL: backendUrl,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:3005",
        "http://localhost:3001",
        backendUrl,
        clientUrl,
    ].filter(Boolean),
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId:
                process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLENT_ID || "",
            clientSecret:
                process.env.GOOGLE_CLIENT_SECRET ||
                process.env.GOOGLE_CLENT_SECRET ||
                "",
        },
    },
});
