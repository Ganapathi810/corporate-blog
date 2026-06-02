import type { Request, Response } from "express"
import { UserRepository } from "./user.repository.js"
import { UserService } from "./user.service.js"
import { sendSuccess } from "../../utils/response.util.js"
import { AuditLogService } from "../audit-log/audit-log.service.js"
import { AuditLogRepository } from "../audit-log/audit-log.repository.js"

const auditLogService = new AuditLogService(new AuditLogRepository())
const userService = new UserService(new UserRepository(), auditLogService)



export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params

    await userService.deleteUser(id as string, req.user?.id)

    sendSuccess(res, "User deleted successfully", 204)

}

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params
    await userService.updateUser(id as string, req.body, req.user?.id)

    sendSuccess(res, "User updated successfully")

}

export const getUsers = async (req: Request, res: Response) => {
    const users = await userService.getUsers()
    sendSuccess(res, users)
}

export const getUserBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params
    const user = await userService.getUserBySlug(slug as string)
    if (!user) {
        res.status(404).json({ success: false, error: "User not found" })
        return
    }
    sendSuccess(res, user)
}