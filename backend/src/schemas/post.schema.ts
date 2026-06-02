import { z } from "zod";
import type { Prisma } from "../generated/prisma/index.js";

const postStatusEnum = z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "REJECTED"]);

export const createPostScheme = z.object({
    body: z.object({
        title: z
            .string()
            .max(120, "Title cannot exceed 120 characters")
            .trim()
            .nullable()
            .optional(),

        slug: z
            .string()
            .min(1, "Slug is required")
            .optional(),

        content: z.custom<Prisma.InputJsonValue>().nullable().optional(),

        excerpt: z
            .string()
            .max(255, "Excerpt cannot exceed 255 characters")
            .trim()
            .nullable()
            .optional(),

        status: postStatusEnum.optional().default("DRAFT"),

        isPremium: z.boolean().optional().default(false),
        isSponsored: z.boolean().optional().default(false),

        imageIds: z.array(z.string()).optional(),
        bannerImageId: z.string().nullable().optional(),

        categoryIds: z.array(z.string())
            .max(3, "You can select up to 3 categories")
            .optional(),
    }).superRefine((data, ctx) => {
        // Strict validation only if not a draft
        if (data.status === "PUBLISHED" || data.status === "IN_REVIEW") {
            if (!data.title?.trim()) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Title is required", path: ["title"] });
            }
            if (!data.excerpt?.trim()) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Excerpt is required", path: ["excerpt"] });
            }
            if (!data.content || (typeof data.content === 'object' && Object.keys(data.content as object).length === 0)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Content is required", path: ["content"] });
            }
            if (!data.categoryIds || data.categoryIds.length === 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least one category is required", path: ["categoryIds"] });
            }
            if (!data.bannerImageId) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Banner image is required", path: ["bannerImageId"] });
            }
        }
    }),
});

export const getPostSchema = z.object({
    params: z.object({
        slug: z.string().min(1, "Slug is requried")
    }),
});

export const updatePostSchema = z.object({
    params: z.object({
        slug: z.string().min(1, "Slug is required")
    }),
    body: z.object({
        title: z
            .string()
            .max(120, "Title cannot exceed 120 characters")
            .trim()
            .nullable()
            .optional(),

        content: z
            .custom<Prisma.InputJsonValue>()
            .nullable()
            .optional(),

        excerpt: z
            .string()
            .max(255, "Excerpt cannot exceed 255 characters")
            .trim()
            .nullable()
            .optional(),

        status: postStatusEnum.optional(),

        isPremium: z.boolean().optional(),
        isSponsored: z.boolean().optional(),

        publishedAt: z.coerce.date().optional(),

        imageIds: z.array(z.string()).optional(),
        bannerImageId: z.string().nullable().optional(),

        categoryIds: z.array(z.string())
            .max(3, "You can select up to 3 categories")
            .optional(),

        pendingAction: z.literal("EDIT_REQUEST").nullable().optional(),

        slug: z.string().optional(),
    }).superRefine((data, ctx) => {
        // Strict validation only if transitioning to PUBLISHED or IN_REVIEW
        if (data.status === "PUBLISHED" || data.status === "IN_REVIEW") {
            // Note: Update might be partial, but the user requested strict validation for these states.
            // If the user is updating to PUBLISHED, they should provide all required fields if they are missing.
            // However, we check if they are explicitly being set to null or empty in the update.
            
            if (data.title === null || (data.title !== undefined && !data.title.trim())) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Title cannot be empty for published posts", path: ["title"] });
            }
            if (data.excerpt === null || (data.excerpt !== undefined && !data.excerpt.trim())) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Excerpt cannot be empty for published posts", path: ["excerpt"] });
            }
            if (data.bannerImageId === null) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Banner image is required for published posts", path: ["bannerImageId"] });
            }
            if (data.categoryIds !== undefined && data.categoryIds.length === 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least one category is required for published posts", path: ["categoryIds"] });
            }
        }
    }),
});


export type CreatePostInput = z.infer<typeof createPostScheme>["body"];
export type GetPostInput = z.infer<typeof getPostSchema>["params"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];