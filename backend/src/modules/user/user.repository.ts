import { prisma } from "../../database/prisma.client.js";
import type { CreateUserInput, UpdateUserInput } from "../../schemas/user.schema.js";

export class UserRepository {
    async create(data: CreateUserInput): Promise<void> {
        await prisma.user.create({ data })
    }

    async update(id: string, data: UpdateUserInput): Promise<void> {
        await prisma.user.update({ where: { id }, data })
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({ where: { id } })
    }

    async findAll() {
        return prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                slug: true,
                createdAt: true
            }
        })
    }

    async findBySlug(slug: string) {
        return prisma.user.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                image: true,
                role: true,
                slug: true,
                createdAt: true
            }
        })
    }
}