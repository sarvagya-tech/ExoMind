import { Router } from "express";
import {
    createWorkspace,
    deleteWorkspace,
    getWorkspace,
    listWorkspaces,
    updateWorkspace,
} from "../controllers/workspace.controller.js";
import { requireAuth } from "../middleware/authentication.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const workspaceRoutes = Router();

workspaceRoutes.use(requireAuth);

workspaceRoutes.get("/", asyncHandler(listWorkspaces));
workspaceRoutes.post("/", asyncHandler(createWorkspace));
workspaceRoutes.get("/:workspaceId", asyncHandler(getWorkspace));
workspaceRoutes.patch("/:workspaceId", asyncHandler(updateWorkspace));
workspaceRoutes.delete("/:workspaceId", asyncHandler(deleteWorkspace));