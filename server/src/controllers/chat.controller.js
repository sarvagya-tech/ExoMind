import {
    listConversationsForWorkspace,
    createConversationForWorkspace,
    getConversationMessagesForWorkspace,
    deleteConversationForWorkspace,
    streamWorkspaceChat,
} from "../services/chat.service.js";
import { ValidationError } from "../utils/app.error.js";
import { getZodFieldErrors } from "../utils/zod-error.js";
import {
    chatBodySchema,
    conversationIdParamSchema,
    createConversationSchema,
} from "../validators/chat.validator.js";
import { workspaceIdParamSchema } from "../validators/workspace.validator.js";

const parseWorkspaceId = (params) => {
    const parsed = workspaceIdParamSchema.safeParse(params);
    if (!parsed.success) {
        throw new ValidationError("Invalid workspace ID", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
};

const parseConversationParams = (params) => {
    const parsed = conversationIdParamSchema.safeParse(params);
    if (!parsed.success) {
        throw new ValidationError("Invalid conversation parameters", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
};

export const listConversations = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const userId = req.session.user.id;
    const conversations = await listConversationsForWorkspace(workspaceId, userId);
    res.json(conversations);
};

export const createConversation = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const parsed = createConversationSchema.safeParse(req.body);
    const title = parsed.success ? parsed.data.title : undefined;
    const userId = req.session.user.id;
    const conversation = await createConversationForWorkspace(workspaceId, userId, title);
    res.status(201).json(conversation);
};

export const getConversationMessages = async (req, res) => {
    const { workspaceId, conversationId } = parseConversationParams(req.params);
    const userId = req.session.user.id;
    const messages = await getConversationMessagesForWorkspace(workspaceId, conversationId, userId);
    res.json(messages);
};

export const deleteConversation = async (req, res) => {
    const { workspaceId, conversationId } = parseConversationParams(req.params);
    const userId = req.session.user.id;
    await deleteConversationForWorkspace(workspaceId, conversationId, userId);
    res.status(204).send();
};

export const streamChat = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const parsed = chatBodySchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ValidationError("Invalid chat payload", getZodFieldErrors(parsed.error));
    }
    const userId = req.session.user.id;
    await streamWorkspaceChat(res, workspaceId, userId, parsed.data);
};
