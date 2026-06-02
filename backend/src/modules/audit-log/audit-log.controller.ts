import type { Request, Response } from "express";
import { AuditLogService } from "./audit-log.service.js";
import { AuditLogRepository } from "./audit-log.repository.js";
import { sendSuccess } from "../../utils/response.util.js";
import { AuditAction, AuditEntity } from "../../generated/prisma/index.js";

const auditLogService = new AuditLogService(new AuditLogRepository());

export const getAuditLogs = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const filters = {
        userId: req.query.userId as string,
        action: req.query.action as AuditAction,
        entity: req.query.entity as AuditEntity,
    };

    const result = await auditLogService.getLogs(page, limit, filters);
    sendSuccess(res, result);
};
