import { auth } from "../lib/auth.js";

export async function requireAuth(req, res, next) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "You are not logged in",
            });
        }

        req.session = session;
        req.user = session.user;
        return next();
    } catch (error) {
        return next(error);
    }
}
