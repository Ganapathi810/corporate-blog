import { Router } from "express";
import { getCategories, createCategory, deleteCategory, getCategoryBySlug } from "./category.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = Router();

router.get("/", getCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.post("/", requireAuth, requireRole("ADMIN"), createCategory);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteCategory);

export { router as categoryRouter };
