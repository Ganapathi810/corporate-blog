import { prisma } from "../../database/prisma.client.js";

export class CategoryRepository {
    async findAll() {
        return prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
    }

    async create(name: string) {
        const slug = name.toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
            
        return prisma.category.create({
            data: { name, slug }
        });
    }

    async findBySlug(slug: string) {
        return prisma.category.findUnique({ where: { slug } });
    }

    async delete(id: string) {
        return prisma.category.delete({
            where: { id }
        });
    }
}
