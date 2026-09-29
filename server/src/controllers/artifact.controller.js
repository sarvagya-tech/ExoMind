import {
    listArtifactsForWorkspace,
    getArtifactForWorkspace,
    createArtifactForWorkspace,
    deleteArtifactForWorkspace,
} from "../services/artifact.service.js";
import { ValidationError } from "../utils/app.error.js";
import { getZodFieldErrors } from "../utils/zod-error.js";
import {
    artifactIdParamSchema,
    createArtifactSchema,
} from "../validators/artifact.validator.js";
import { workspaceIdParamSchema } from "../validators/workspace.validator.js";

const parseWorkspaceId = (params) => {
    const parsed = workspaceIdParamSchema.safeParse(params);
    if (!parsed.success) {
        throw new ValidationError("Invalid workspace ID", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
};

const parseArtifactParams = (params) => {
    const parsed = artifactIdParamSchema.safeParse(params);
    if (!parsed.success) {
        throw new ValidationError("Invalid artifact parameters", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
};

export const listArtifacts = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const userId = req.session.user.id;
    const artifacts = await listArtifactsForWorkspace(workspaceId, userId);
    res.json(artifacts);
};

export const getArtifact = async (req, res) => {
    const { workspaceId, artifactId } = parseArtifactParams(req.params);
    const userId = req.session.user.id;
    const artifact = await getArtifactForWorkspace(workspaceId, artifactId, userId);
    res.json(artifact);
};

export const createArtifact = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const parsed = createArtifactSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ValidationError("Invalid artifact payload", getZodFieldErrors(parsed.error));
    }
    const userId = req.session.user.id;
    const artifact = await createArtifactForWorkspace(workspaceId, userId, parsed.data);
    res.status(201).json(artifact);
};

export const deleteArtifact = async (req, res) => {
    const { workspaceId, artifactId } = parseArtifactParams(req.params);
    const userId = req.session.user.id;
    await deleteArtifactForWorkspace(workspaceId, artifactId, userId);
    res.status(204).send();
};
