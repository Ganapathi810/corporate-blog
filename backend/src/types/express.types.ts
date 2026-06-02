import type { Role } from "../generated/prisma/index.js";

export interface AuthUser {
    id: string;
    role: Role;
    email: string;
    slug?: string | null | undefined;
}

declare global {
    namespace Express {
        interface Request {
            requestId: string;
            user?:  AuthUser
        }
    }
}