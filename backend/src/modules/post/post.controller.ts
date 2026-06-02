import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response.util.js";
import { PostRepository } from "./post.repository.js";
import { PostService } from "./post.service.js";

import { AuditLogService } from "../audit-log/audit-log.service.js";
import { AuditLogRepository } from "../audit-log/audit-log.repository.js";

const auditLogService = new AuditLogService(new AuditLogRepository());
const postService = new PostService(new PostRepository(), auditLogService);


export async function getPosts(req: Request, res: Response): Promise<void> {
    throw new Error("backend error simulation for sentry")

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const authorId = req.query.authorId ? String(req.query.authorId) : undefined
    const status = req.query.status ? String(req.query.status) : undefined
    const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined
    const sortBy = (req.query.sortBy as any) || 'latest'
    const search = req.query.search ? String(req.query.search) : undefined
    
    const authorSlug = req.query.authorSlug ? String(req.query.authorSlug) : undefined
    const categorySlug = req.query.categorySlug ? String(req.query.categorySlug) : undefined
    
    const posts = await postService.getPosts(page, limit, authorId, status, categoryId, sortBy, search, authorSlug, categorySlug)
    sendSuccess(res, posts, 200)

}


export async function createPost(req: Request, res: Response): Promise<void> {
    const authorId = req.user!.id
    const post = await postService.createPost(authorId, req.body)
    sendSuccess(res, post, 201)
}

export async function getPostById(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const post = await postService.getPostById(id as string)
    sendSuccess(res, post)
}

export async function getPostBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params
    const post = await postService.getPostBySlug(slug as string)
    if (!post) {
        res.status(404).json({ success: false, error: "Post not found" })
        return
    }
    sendSuccess(res, post)
}

export async function updatePost(req: Request, res: Response): Promise<void> {
    const { slug } = req.params
    const post = await postService.updatePost(slug as string, req.body, req.user?.id, req.user?.role)
    sendSuccess(res, post)


}

export async function deletePost(req: Request, res: Response): Promise<void> {
    const { slug } = req.params
    await postService.deletePost(slug as string, req.user?.id)
    sendSuccess(res, "Post deleted successfully")

}

export async function requestEdit(req: Request, res: Response): Promise<void> {
    const { slug } = req.params
    const post = await postService.requestEdit(slug as string, req.user!.id)
    sendSuccess(res, post, 201)
}

export async function getInternalSuggestions(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const suggestions = await postService.getInternalSuggestions(id as string)
    sendSuccess(res, suggestions)
}

export async function incrementView(req: Request, res: Response): Promise<void> {
    const { slug } = req.params
    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0'
    const userAgent = req.headers['user-agent'] || 'unknown'
    
    // Convert array-like IP from x-forwarded-for if needed
    const ipString = Array.isArray(ip) ? (ip[0] ?? '0.0.0.0') : String(ip)

    await postService.trackView(slug as string, ipString, userAgent)
    sendSuccess(res, { message: "View tracked" })
}

export async function getPopularPosts(req: Request, res: Response): Promise<void> {
    const limit = Number(req.query.limit) || 5
    const posts = await postService.getPopularPosts(limit)
    sendSuccess(res, posts)
}

export async function getTrendingPosts(req: Request, res: Response): Promise<void> {
    const limit = Number(req.query.limit) || 5
    const posts = await postService.getTrendingPosts(limit)
    sendSuccess(res, posts)
}


