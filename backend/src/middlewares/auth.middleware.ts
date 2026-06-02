import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/HttpErrors.js";
import { auth } from "../config/auth.config.js";
import { fromNodeHeaders } from "better-auth/node";

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });

        if (!session) {
            return next(new UnauthorizedError("Unauthorized! Please login."));
        }

        // Populate req.user for downstream middleware/controllers
        req.user = {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role as any, // Better Auth user.role is a string
            slug: session.user.slug as string | undefined,
        };

        next();
    } catch (error) {
        next(error);
    }
};