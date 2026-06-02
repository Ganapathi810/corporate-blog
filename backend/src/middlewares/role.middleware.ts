import type { NextFunction, Request, Response } from "express";
import type { Role } from "../generated/prisma/index.js";
import { ForbiddenError, UnauthorizedError } from "../errors/HttpErrors.js";

export const requireRole =
    (...roles: Role[]) =>
    (req: Request, _res: Response, next: NextFunction) => {

        if(!req.user) {
            throw new UnauthorizedError('User must login!')
        }

        if(!roles.includes(req.user.role)) {
            throw new ForbiddenError("Access denied!")
        }

        next()
    }