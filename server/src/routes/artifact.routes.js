import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import {
    listArtifacts,
    getArtifact,
    createArtifact,
    deleteArtifact,
} from "../controllers/artifact.controller.js";

export const artifactRoutes = Router({ mergeParams: true });

artifactRoutes.get("/", asyncHandler(listArtifacts));
artifactRoutes.post("/", asyncHandler(createArtifact));
artifactRoutes.get("/:artifactId", asyncHandler(getArtifact));
artifactRoutes.delete("/:artifactId", asyncHandler(deleteArtifact));
