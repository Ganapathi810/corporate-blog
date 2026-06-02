import { prisma } from "../../database/prisma.client.js";
import { AuditAction, AuditEntity, type AuditLog, type Prisma } from "../../generated/prisma/index.js";

export class AuditLogRepository {
    async create(data: Prisma.AuditLogUncheckedCreateInput): Promise<AuditLog> {
        return prisma.auditLog.create({
            data
        })
    }

    async findAll(page: number = 1, limit: number = 20, filters?: {
        userId?: string;
        action?: AuditAction;
        entity?: AuditEntity;
    }) {
        const skip = (page - 1) * limit;
        const where: Prisma.AuditLogWhereInput = {};

        if (filters?.userId) where.userId = filters.userId;
        if (filters?.action) where.action = filters.action;
        if (filters?.entity) where.entity = filters.entity;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                            role: true
                        }
                    },
                    post: {
                        select: {
                            id: true,
                            title: true,
                            slug: true
                        }
                    }
                }
            }),
            prisma.auditLog.count({ where })
        ]);

        return {
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }
}
