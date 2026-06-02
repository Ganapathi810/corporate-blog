import { AuditAction, AuditEntity } from "../../generated/prisma/index.js";
import type { AuditLogRepository } from "./audit-log.repository.js";
import { logger } from "../../utils/logger.util.js";

export class AuditLogService {
    private static instance: AuditLogService;
    
    constructor(private readonly auditRepo: AuditLogRepository) {
        AuditLogService.instance = this;
    }

    public static getInstance(): AuditLogService {
        return AuditLogService.instance;
    }

    async getLogs(page: number, limit: number, filters?: any) {
        return this.auditRepo.findAll(page, limit, filters)
    }

    async log(data: {
        userId?: string | null | undefined;
        postId?: string | null | undefined;
        action: AuditAction;
        entity: AuditEntity;
        entityId?: string | null | undefined;
        metadata?: any;
    }) {


        try {
            return await this.auditRepo.create({
                userId: data.userId ?? null,
                postId: data.postId ?? null,
                action: data.action,
                entity: data.entity,
                entityId: data.entityId ?? null,
                metadata: data.metadata || {}
            })

        } catch (error) {
            logger.error("Failed to create audit log", { error });
            // We don't want to throw here to avoid breaking the main business flow
        }
    }
}
