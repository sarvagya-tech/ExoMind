import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import {
    listConversations,
    createConversation,
    getConversationMessages,
    deleteConversation,
    streamChat,
} from "../controllers/chat.controller.js";

export const chatRoutes = Router({ mergeParams: true });

// Mounted under /api/workspaces/:workspaceId/conversations and /api/workspaces/:workspaceId/chat
chatRoutes.get("/", asyncHandler(listConversations));
chatRoutes.post("/", asyncHandler(createConversation));
chatRoutes.get("/:conversationId/messages", asyncHandler(getConversationMessages));
chatRoutes.delete("/:conversationId", asyncHandler(deleteConversation));
