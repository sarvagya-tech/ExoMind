import { inngest } from "../inngest/client.js";


export async function enqueueConversationSummarize(
    conversationId,
    userId
) {
    await inngest.send({
        name: "conversation/summarize",
        data: input,
    });
}