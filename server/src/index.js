import express from "express";
import "dotenv/config";
import { auth } from "./lib/auth.js";
import { toNodeHandler } from "better-auth/node";
import { inngest } from "./inngest/client.js";
import { serve } from "inngest/express";
import { functions } from "./inngest/index.js";
import { registerRoutes } from "./routes/index.js";

const app = express();

const port = process.env.PORT ?? 3000;

// CORS Middleware for client integration
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
    }
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});

app.all("/api/auth/*any", toNodeHandler(auth));
// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

app.use("/api/inngest", serve({ client: inngest, functions }));

// Register application routes
registerRoutes(app);

app.get("/", (req, res) => {
    res.json({ status: 200, message: "server is running" });
});

app.listen(port, () => {
    console.log(`server is running on the portnumber ${port}`);
});

export { app };
