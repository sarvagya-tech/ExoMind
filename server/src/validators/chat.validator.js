import { z } from 'zod';
import { CHAT_MODELS } from '../lib/ai-config.js';
import { workspaceIdParamSchema } from './workspace.validator.js';

export const conversationIdParamSchema = workspaceIdParamSchema.extend({
    conversationId: z.string().trim().min(1, 'Conversation id is required'),
});

export const chatBodySchema = z.object({
    conversationId: z.string().trim().min(1).nullish().optional(),
    messages: z.array(z.record(z.string(), z.unknown())).min(1),
    model: z.string().nullish().optional(),
    webSearch: z.boolean().nullish().optional(),
    selectedSourceIds: z.array(z.string()).nullish().optional(),
});

export const createConversationSchema = z.object({
    title: z.string().trim().min(1).max(120).optional(),
});
