import { z } from "zod";

const userRoleEnum = z.enum(['ADMIN', 'EDITOR', 'WRITER'])

export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(3, "Name must be at least 3 characters long"),
        email: z.string().email("Invalid email").min(1, "Email is required"),
        slug: z.string().min(3, "Slug must be at least 3 characters long"),
        imageUrl: z.string().url("Invalid URL"),
        role: userRoleEnum,
    })
})

export const updateUserSchema = z.object({
    params: z.object({
        id: z.string().min(1, "User ID is required"),
    }),
    body: z.object({
        role: userRoleEnum,
    }),
})

export type CreateUserInput = z.infer<typeof createUserSchema>["body"]
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"]