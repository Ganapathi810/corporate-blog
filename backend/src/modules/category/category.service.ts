import type { CategoryRepository } from "./category.repository.js";

export class CategoryService {
    constructor(private readonly categoryRepo: CategoryRepository) {}

    async getCategories() {
        return this.categoryRepo.findAll();
    }

    async createCategory(name: string) {
        return this.categoryRepo.create(name);
    }

    async deleteCategory(id: string) {
        return this.categoryRepo.delete(id);
    }

    async getCategoryBySlug(slug: string) {
        return this.categoryRepo.findBySlug(slug);
    }
}
