import {
    findWorkspaceByIdAndUserId,
    findWorkspacesByUserId,
    createWorkspaceRecord,
    updateWorkspaceRecord,
    deleteWorkspaceRecord,
} from "../repository/workspace.repository.js";
import { NotFoundError } from "../utils/app.error.js";

const listWorkspacesByUser = async (userId) => {
    return await findWorkspacesByUserId(userId);
};

const getWorkspaceByIdForUser = async ({ workspaceId, userId }) => {
    const workspace = await findWorkspaceByIdAndUserId(workspaceId, userId);
    if (!workspace) {
        throw new NotFoundError("Workspace not found");
    }
    return workspace;
};

const createWorkSpaceByUser = async ({ userId, data }) => {
    return await createWorkspaceRecord(userId, data);
};

const updateWorkSpaceByUser = async ({ workspaceId, userId, data }) => {
    await getWorkspaceByIdForUser({ workspaceId, userId });
    return await updateWorkspaceRecord(workspaceId, data);
};

const deleteWorkspaceByUser = async ({ workspaceId, userId }) => {
    await getWorkspaceByIdForUser({ workspaceId, userId });
    return await deleteWorkspaceRecord(workspaceId);
};

export {
    listWorkspacesByUser,
    getWorkspaceByIdForUser,
    createWorkSpaceByUser,
    updateWorkSpaceByUser,
    deleteWorkspaceByUser,
};
