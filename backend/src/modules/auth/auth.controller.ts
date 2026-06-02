import { fromNodeHeaders } from "better-auth/node"
import { auth } from "../../config/auth.config.js"
import type { Request, Response } from "express"
import { sendSuccess } from "../../utils/response.util.js"
import { AuthService } from "./auth.service.js"

const authService = new AuthService()



export const getUserSession = async (req: Request, res: Response): Promise<void> => {
    const session = await authService.getSessionFromRequest(req)

    sendSuccess(res, session)
}