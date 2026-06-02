/**
 * PostService — owns all business rules.
 *
 * Rules:
 *  - Never touches req/res (no HTTP awareness)
 *  - Throws typed AppError subclasses; never raw Errors
 *  - Delegates all DB calls to PostRepository
 */


import type { PostRepository } from "./post.repository.js";
import type { CreatePostInput, UpdatePostInput } from "../../schemas/post.schema.js";
import type { Post } from "../../generated/prisma/index.js";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../../errors/HttpErrors.js";
import { generateSlug } from "../../utils/slug.util.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { AuditAction, AuditEntity } from "../../generated/prisma/index.js";
import { extractPlainTextFromTiptap } from "../../utils/text.util.js";
import { generateViewHash, getDayString } from "../../utils/hash.util.js";


export class PostService {
    constructor(
        private readonly postRepo: PostRepository,
        private readonly auditLog?: AuditLogService
    ) {}


    async getPosts(page: number = 1, limit: number = 10, authorId?: string, status?: string, categoryId?: string, sortBy: 'latest' | 'oldest' | 'popular' | 'trending' = 'latest', search?: string, authorSlug?: string, categorySlug?: string): Promise<Post[]> {
        return this.postRepo.findAll(page, limit, authorId, status, categoryId, sortBy, search, authorSlug, categorySlug)
    }

    async getPopularPosts(limit: number = 5): Promise<Post[]> {
        return this.postRepo.findAll(1, limit, undefined, "PUBLISHED", undefined, "popular")
    }

    async getTrendingPosts(limit: number = 5): Promise<Post[]> {
        return this.postRepo.findAll(1, limit, undefined, "PUBLISHED", undefined, "trending")
    }

    async getPostBySlug(slug: string): Promise<Post | null> {
        return this.postRepo.findBySlug(slug)
    }

    async getPostById(id: string): Promise<Post | null> {
        return this.postRepo.findById(id)
    }

    async trackView(slug: string, ip: string, userAgent: string): Promise<void> {
        const post = await this.postRepo.findBySlug(slug)
        if (!post) return;

        const ipUaHash = generateViewHash(ip, userAgent)
        const dayString = getDayString()

        await this.postRepo.incrementView(post.id, ipUaHash, dayString)
    }

    private validatePublishedState(data: Partial<CreatePostInput | UpdatePostInput>) {
        const errors: string[] = [];
        if (!data.title || data.title.trim().length < 3) errors.push("Title is required (min 3 chars)");
        if (!data.categoryIds || data.categoryIds.length === 0) errors.push("At least one category is required");
        if (!data.bannerImageId) errors.push("Banner image is required");
        if (!data.excerpt || data.excerpt.trim().length < 10) errors.push("Excerpt is required (min 10 chars)");
        
        // Basic check for content structure
        const content = data.content as any;
        if (!content || !content.content || !Array.isArray(content.content) || content.content.length === 0) {
            errors.push("Content cannot be empty");
        }

        if (errors.length > 0) {
            throw new BadRequestError(`Cannot publish/review post: ${errors.join(", ")}`);
        }
    }

    async createPost(authorId: string, data: CreatePostInput): Promise<Post> {
        if(!authorId) {
            throw new UnauthorizedError("User must login")
        }

        const status = data.status || "DRAFT"
        
        // Auto-generate excerpt if missing
        if (!data.excerpt || data.excerpt.trim().length === 0) {
            data.excerpt = extractPlainTextFromTiptap(data.content, 150)
        }
        
        // Strict validation for review/publish
        if (status === "PUBLISHED" || status === "IN_REVIEW") {
            this.validatePublishedState(data)
        }

        const currentSlug = data.slug || "untitled-draft"
        const existing = await this.postRepo.findBySlug(currentSlug)

        if(existing) {
            throw new ConflictError('Post already exists with given slug')
        }

        const title = data.title || "Untitled Draft"
        const plainText = extractPlainTextFromTiptap(data.content)
        const searchText = `${title} ${plainText} ${data.excerpt ?? ''}`.toLowerCase()

        const dataWithAddionalFields = {
            ...data,
            title,
            slug: currentSlug,
            status,
            searchText
        }
        
        const post = await this.postRepo.create(authorId, dataWithAddionalFields)

        await this.auditLog?.log({
            userId: authorId,
            postId: post.id,
            action: AuditAction.POST_CREATED,
            entity: AuditEntity.POST,
            entityId: post.id,
            metadata: { title: post.title }
        })

        return post

    }

    async requestEdit(slug: string, userId: string): Promise<Post> {
        const originalPost = await this.postRepo.findBySlug(slug)
        if (!originalPost) throw new NotFoundError("Post")

        if (originalPost.status !== "PUBLISHED") {
            throw new BadRequestError("Only published posts can have edit requests")
        }

        const draftSlug = `${originalPost.slug}-draft`
        let bannerImageId = undefined;
        if (originalPost.bannerImageId) {
            const newBannerId = await this.postRepo.duplicateImage(originalPost.bannerImageId);
            if (newBannerId) bannerImageId = newBannerId;
        }
        
        const data: CreatePostInput & { searchText: string, originalPostId?: string, pendingAction?: "EDIT_REQUEST" | "REMOVAL_REQUEST" | null } = {
            title: originalPost.title,
            slug: draftSlug,
            content: originalPost.content as any,
            excerpt: originalPost.excerpt || undefined,
            status: "IN_REVIEW",
            isPremium: originalPost.isPremium,
            isSponsored: originalPost.isSponsored,
            bannerImageId: bannerImageId,
            categoryIds: (originalPost as any).categories.map((c: any) => c.categoryId),
            searchText: originalPost.searchText,
            originalPostId: originalPost.id,
            pendingAction: "EDIT_REQUEST"
        };
        
        return this.postRepo.create(originalPost.authorId, data)
    }




    async updatePost(slug: string, data: UpdatePostInput, userId?: string, userRole?: string): Promise<Post> {
        // Find existing post to check current state
        const existingPost = await this.postRepo.findBySlug(slug)
        if (!existingPost) {
            throw new NotFoundError("Post")
        }

        // Merge existing data with new data for validation if we are transitioning to a strict state
        const targetStatus = data.status || existingPost.status
        
        // Auto-generate excerpt if field is being cleared or is missing in a draft update
        if (data.excerpt === null || (data.excerpt === undefined && !existingPost.excerpt)) {
             // We only auto-generate if the content is also being updated or already exists
             const contentToUse = data.content ?? existingPost.content;
             data.excerpt = extractPlainTextFromTiptap(contentToUse, 150);
        } else if (data.excerpt === "") {
             const contentToUse = data.content ?? existingPost.content;
             data.excerpt = extractPlainTextFromTiptap(contentToUse, 150);
        }

        if (targetStatus === "PUBLISHED" || targetStatus === "IN_REVIEW") {
            // We combine the existing post state with updates to validate the final object
            this.validatePublishedState({
                title: data.title ?? existingPost.title,
                content: (data.content ?? existingPost.content) as any,
                categoryIds: data.categoryIds ?? (existingPost as any).categories.map((c: any) => c.categoryId),
                bannerImageId: data.bannerImageId ?? existingPost.bannerImageId ?? undefined,
                excerpt: data.excerpt ?? existingPost.excerpt ?? undefined
            })
        }

        const isEditor = userRole === "EDITOR"
        const isAdmin = userRole === "ADMIN"
        
        const plainText = extractPlainTextFromTiptap(data.content ?? existingPost.content)
        const searchText = `${data.title ?? existingPost.title} ${plainText} ${data.excerpt ?? existingPost.excerpt ?? ''}`.toLowerCase()

        let finalEditedByEditor = existingPost.editedByEditor;
        let finalEditedByAdmin = existingPost.editedByAdmin;

        const isContentModified = data.title !== undefined || data.content !== undefined || data.excerpt !== undefined;

        if (existingPost.authorId !== userId) {
            if (isContentModified) {
                if (isAdmin) {
                    finalEditedByAdmin = true;
                    finalEditedByEditor = false;
                } else if (isEditor) {
                    finalEditedByEditor = true;
                    finalEditedByAdmin = false;
                }
            }
        } else {
            // Author interacting clears the polish badges if they modify content
            if (isContentModified) {
                finalEditedByEditor = false;
                finalEditedByAdmin = false;
            }
        }

        const updateData = {
            ...data,
            searchText,
            editedByEditor: finalEditedByEditor,
            editedByAdmin: finalEditedByAdmin
        }

        let post: Post;

        const updatePayload = {
            ...updateData,
            title: data.title ?? existingPost.title,
            content: (data.content ?? existingPost.content) as any,
            excerpt: data.excerpt !== undefined ? data.excerpt : (existingPost.excerpt || undefined),
            categoryIds: data.categoryIds ?? (existingPost as any).categories.map((c: any) => c.categoryId),
            bannerImageId: data.bannerImageId ?? existingPost.bannerImageId ?? undefined,
            status: "PUBLISHED" as const
        };

        // If approving a draft that has an original post, overwrite original and delete draft
        if (targetStatus === "PUBLISHED" && (existingPost as any).originalPostId) {
            const originalPostId = (existingPost as any).originalPostId;
            const originalPost = await this.postRepo.findById(originalPostId);
            if (!originalPost) throw new NotFoundError("Original Post not found");
            
            await this.postRepo.delete(existingPost.slug);
            post = await this.postRepo.update(originalPost.slug, updatePayload);
        } else {
            post = await this.postRepo.update(slug, updateData)
        }

        // Log publish event if status changed to PUBLISHED
        if (data.status === "PUBLISHED" && existingPost.status !== "PUBLISHED") {
            await this.auditLog?.log({
                userId,
                postId: post.id,
                action: AuditAction.POST_PUBLISHED,
                entity: AuditEntity.POST,
                entityId: post.id,
                metadata: { title: post.title }
            })
        } else if (data.status !== undefined || data.pendingAction !== undefined) {
            await this.auditLog?.log({
                userId,
                postId: post.id,
                action: AuditAction.POST_UPDATED,
                entity: AuditEntity.POST,
                entityId: post.id,
                metadata: { title: post.title, fields: Object.keys(data) }
            })
        }

        return post
    }



    async deletePost(slug: string, userId?: string): Promise<void> {
        const post = await this.postRepo.findBySlug(slug)
        if (post) {
            await this.auditLog?.log({
                userId,
                postId: post.id,
                action: AuditAction.POST_DELETED,
                entity: AuditEntity.POST,
                entityId: post.id,
                metadata: { title: post.title }
            })
        }
        await this.postRepo.delete(slug)
    }

    async getInternalSuggestions(id: string): Promise<any[]> {
        const post = await this.postRepo.findById(id)
        if (!post) throw new NotFoundError("Post")
        
        return this.postRepo.getInternalSuggestions(id)
    }
}