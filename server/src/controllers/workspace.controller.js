import {
    createWorkSpaceByUser,
    listWorkspacesByUser,
    updateWorkSpaceByUser,
    getWorkspaceByIdForUser,
    deleteWorkspaceByUser,
} from "../services/workspace.services.js";
import { ValidationError } from "../utils/app.error.js";
import { getZodFieldErrors } from "../utils/zod-error.js";
import {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    workspaceIdParamSchema,
} from "../validators/workspace.validator.js";

const parseWorkspaceId = (params) => {
    const parsed = workspaceIdParamSchema.safeParse(params);
    if (!parsed.success) {
        throw new ValidationError("Invalid workspace ID", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
};

const parseCreateBody = (body) => {
    const parsed = createWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError("Validation failed", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
};

const parseUpdateBody = (body) => {
    const parsed = updateWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError("Validation failed", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
};

const listWorkspaces = async (req, res) => {
    const userId = req.session.user.id;
    const workspaces = await listWorkspacesByUser(userId);
    res.json(workspaces);
};

const getWorkspace = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const workspace = await getWorkspaceByIdForUser({
        workspaceId,
        userId: req.session.user.id,
    });
    res.json(workspace);
};

const createWorkspace = async (req, res) => {
    const data = parseCreateBody(req.body);
    const workspace = await createWorkSpaceByUser({
        userId: req.session.user.id,
        data,
    });
    res.status(201).json(workspace);
};

const updateWorkspace = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const data = parseUpdateBody(req.body);
    const workspace = await updateWorkSpaceByUser({
        workspaceId,
        data,
        userId: req.session.user.id,
    });
    res.json(workspace);
};

const deleteWorkspace = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    await deleteWorkspaceByUser({
        workspaceId,
        userId: req.session.user.id,
    });
    res.status(204).send();
};

export {
    listWorkspaces,
    createWorkspace,
    updateWorkspace,
    getWorkspace,
    deleteWorkspace,
};