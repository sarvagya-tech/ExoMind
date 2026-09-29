import { ValidationError } from "../utils/app.error.js";
import {
    bulkDeleteSourcesForWorkspace,
    importWebsiteSource,
    importYoutubeSource,
    listSourcesForWorkspace,
    uploadPdfSource,
    getSourceForWorkspace,
    deleteSourceForWorkspace,
    createTextOrMarkdownSource,
} from "../services/source.services.js";
import {
    bulkDeleteSourcesSchema,
    createSourceSchema,
    listsourceQuery,
    sourceIdParamSchema,
    importWebsiteSchema,
    importYoutubeSchema,
} from "../validators/source.validator.js";
import { workspaceIdParamSchema } from "../validators/workspace.validator.js";
import { getZodFieldErrors } from "../utils/zod-error.js";

const parseSourceParams = (params) => {
    const parsed = sourceIdParamSchema.safeParse(params);
    if (!parsed.success) {
        throw new ValidationError("Invalid source ID", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
};

const parseWorkspaceId = (params) => {
    const parsed = workspaceIdParamSchema.safeParse(params);
    if (!parsed.success) {
        throw new ValidationError("Invalid workspace ID", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
};

const parseListQuery = (query) => {
    const parsed = listsourceQuery.safeParse(query);
    if (!parsed.success) {
        throw new ValidationError("Invalid list query", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
};

const parseCreateBody = (body) => {
    const parsed = createSourceSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError("Validation failed", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
};

const parseBulkDeleteBody = (body) => {
    const parsed = bulkDeleteSourcesSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError("Validation failed", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
};

const listSources = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const filter = parseListQuery(req.query);
    const sources = await listSourcesForWorkspace(workspaceId, req.session.user.id, filter);
    res.json(sources);
};

const createSource = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const input = parseCreateBody(req.body);
    const source = await createTextOrMarkdownSource(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.status(201).json(source);
};

const getSource = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const { sourceId } = parseSourceParams(req.params);
    const userId = req.session.user.id;
    const source = await getSourceForWorkspace(workspaceId, sourceId, userId);
    res.json(source);
};

const deleteSource = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const { sourceId } = parseSourceParams(req.params);
    const userId = req.session.user.id;
    await deleteSourceForWorkspace(workspaceId, sourceId, userId);
    res.status(204).send();
};

const bulkDeleteSources = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const input = parseBulkDeleteBody(req.body);
    const userId = req.session.user.id;
    await bulkDeleteSourcesForWorkspace(workspaceId, input.sourceIds, userId);
    res.status(204).send();
};

const uploadPdf = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const file = req.file;
    if (!file) {
        throw new ValidationError("PDF file is required");
    }
    const userId = req.session.user.id;
    const title = typeof req.body.title === "string" ? req.body.title : undefined;
    const source = await uploadPdfSource(workspaceId, userId, file, title);
    res.status(201).json(source);
};

const importWebsite = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const input = importWebsiteSchema.parse(req.body);
    const userId = req.session.user.id;
    const source = await importWebsiteSource(workspaceId, userId, input);
    res.status(201).json(source);
};

const importYoutube = async (req, res) => {
    const { workspaceId } = parseWorkspaceId(req.params);
    const input = importYoutubeSchema.parse(req.body);
    const userId = req.session.user.id;
    const source = await importYoutubeSource(workspaceId, userId, input);
    res.status(201).json(source);
};

export {
    importYoutube,
    importWebsite,
    bulkDeleteSources,
    uploadPdf,
    deleteSource,
    getSource,
    listSources,
    createSource,
};