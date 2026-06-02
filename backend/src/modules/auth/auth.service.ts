import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";
import { auth } from "../../config/auth.config.js";
import { UnauthorizedError } from "../../errors/HttpErrors.js";

export class AuthService {
    async getSessionFromRequest(req: Request) {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        })

        if(!session) {
            throw new UnauthorizedError('Session expired, please login')
        }

        return session;
    }
}