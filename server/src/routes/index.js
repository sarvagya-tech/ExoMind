import { memoryRoutes } from "./memory.routes.js";
import { workspaceRoutes } from "./workspace.routes.js";

export function registerRoutes(app) {
    app.use("/api/workspaces", workspaceRoutes);
    app.use("/api/memory", memoryRoutes);
}
