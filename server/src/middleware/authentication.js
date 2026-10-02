import { auth } from "../lib/auth.js";
import prisma from "../lib/db.js";

export async function requireAuth(req, res, next) {
    try {
        let session = null;
        try {
            session = await auth.api.getSession({ headers: req.headers });
        } catch {
            session = null;
        }

        if (session && session.user) {
            req.session = session;
            req.user = session.user;
            return next();
        }

        return res.status(401).json({
            message: "Unauthorized: Please sign in to access this resource.",
            code: "UNAUTHORIZED",
        });
    } catch (error) {
        return next(error);
    }
}
