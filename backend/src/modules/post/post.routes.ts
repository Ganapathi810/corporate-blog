import { Router } from "express";
import { createPostScheme, getPostSchema, updatePostSchema } from "../../schemas/post.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { createPost, deletePost, getPostById, getPostBySlug, getPosts, updatePost, requestEdit, getInternalSuggestions, incrementView, getPopularPosts, getTrendingPosts } from "./post.controller.js";
import { Role } from "../../generated/prisma/index.js";

const router = Router();

router.get("/", getPosts);
router.get("/popular", getPopularPosts);
router.get("/trending", getTrendingPosts);
router.get("/:slug", validate(getPostSchema), getPostBySlug);
router.post("/:slug/view", incrementView);
router.get("/:id/internal-suggestions", getInternalSuggestions);

router.use(requireAuth)

router.post(
    '/', 
    requireRole(Role.ADMIN, Role.EDITOR, Role.WRITER), 
    validate(createPostScheme), 
    createPost
);

router.post(
    '/:slug/request-edit',
    requireRole(Role.ADMIN, Role.EDITOR, Role.WRITER),
    requestEdit
);

router.patch(
    '/:slug',
    requireRole(Role.ADMIN, Role.EDITOR, Role.WRITER), 
    validate(updatePostSchema), 
    updatePost
);

router.delete(
    '/:slug',
    requireRole(Role.ADMIN, Role.EDITOR, Role.WRITER),
    deletePost
);


export { router as postRouter }