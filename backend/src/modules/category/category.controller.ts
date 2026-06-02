import type { Request, Response } from "express";
import { CategoryService } from "./category.service.js";
import { CategoryRepository } from "./category.repository.js";
import { sendSuccess } from "../../utils/response.util.js";

const categoryService = new CategoryService(new CategoryRepository());

export const getCategories = async (req: Request, res: Response) => {
    const categories = await categoryService.getCategories();
    sendSuccess(res, categories);
};

export const createCategory = async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) throw new Error("Name is required");
    const category = await categoryService.createCategory(name);
    sendSuccess(res, category, 201);
};

export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new Error("ID is required");
    await categoryService.deleteCategory(id as string);
    sendSuccess(res, null);
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug as string);
    if (!category) {
        res.status(404).json({ success: false, error: "Category not found" });
        return;
    }
    sendSuccess(res, category);
};
