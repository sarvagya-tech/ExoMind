import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "my-app",
    eventKey: process.env.INNGEST_EVENT_KEY || "local",
    baseUrl: process.env.INNGEST_BASE_URL || (process.env.INNGEST_DEV ? "http://127.0.0.1:8288" : undefined),
    isDev: Boolean(process.env.INNGEST_DEV || process.env.NODE_ENV !== "production"),
});

// Create an empty array where we'll export future Inngest functions
export const functions = [];