import { inngest } from "../inngest/client.js";


export async function enqueueConversationSummarize(
    conversationId,
    userId
) {
    try {
        await inngest.send({
            name: "conversation/summarize",
            data: { conversationId, userId },
        });
    } catch (err) {
        console.warn("[Inngest] Could not enqueue conversation summarize:", err.message);
    }
}