import type { CreateUserInput, UpdateUserInput } from "../../schemas/user.schema.js";
import type { UserRepository } from "./user.repository.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { AuditAction, AuditEntity } from "../../generated/prisma/index.js";


export class UserService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly auditLog?: AuditLogService
    ) {}


    async createUser(data: CreateUserInput): Promise<void> {
        await this.userRepo.create(data)
    }
    
    async updateUser(id: string, data: UpdateUserInput, adminId?: string): Promise<void> {
        const oldUser = await this.userRepo.findAll().then(users => users.find(u => u.id === id))
        await this.userRepo.update(id, data)
        
        if (data.role && oldUser && oldUser.role !== data.role) {
            await this.auditLog?.log({
                userId: adminId,
                action: AuditAction.USER_ROLE_CHANGED,
                entity: AuditEntity.USER,
                entityId: id,
                metadata: { 
                    userName: oldUser.name,
                    oldRole: oldUser.role,
                    newRole: data.role
                }
            })
        }
    }


    async deleteUser(id: string, adminId?: string): Promise<void> {
        const user = await this.userRepo.findAll().then(users => users.find(u => u.id === id))
        if (user) {
            await this.auditLog?.log({
                userId: adminId,
                action: AuditAction.USER_DELETED,
                entity: AuditEntity.USER,
                entityId: id,
                metadata: { userName: user.name, userEmail: user.email }
            })
        }
        await this.userRepo.delete(id)
    }


    async getUsers() {
        return this.userRepo.findAll()
    }

    async getUserBySlug(slug: string) {
        return this.userRepo.findBySlug(slug)
    }
}