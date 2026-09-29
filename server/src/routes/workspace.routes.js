import { Router } from "express";
import {
    createWorkspace,
    deleteWorkspace,
    getWorkspace,
    listWorkspaces,
    updateWorkspace,
} from "../controllers/workspace.controller.js";
import { streamChat } from "../controllers/chat.controller.js";
import { sourceRoutes } from "./source.routes.js";
import { chatRoutes } from "./chat.routes.js";
import { artifactRoutes } from "./artifact.routes.js";
import { requireAuth } from "../middleware/authentication.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const workspaceRoutes = Router();

workspaceRoutes.use(requireAuth);

// Nested resource sub-routers
workspaceRoutes.use("/:workspaceId/sources", sourceRoutes);
workspaceRoutes.use("/:workspaceId/conversations", chatRoutes);
workspaceRoutes.use("/:workspaceId/artifacts", artifactRoutes);
workspaceRoutes.post("/:workspaceId/chat", asyncHandler(streamChat));
workspaceRoutes.post("/:workspaceId/chat/stream", asyncHandler(streamChat));

// Workspace CRUD routes
workspaceRoutes.get("/", asyncHandler(listWorkspaces));
workspaceRoutes.post("/", asyncHandler(createWorkspace));
workspaceRoutes.get("/:workspaceId", asyncHandler(getWorkspace));
workspaceRoutes.patch("/:workspaceId", asyncHandler(updateWorkspace));
workspaceRoutes.delete("/:workspaceId", asyncHandler(deleteWorkspace));