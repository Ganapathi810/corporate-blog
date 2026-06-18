import { prisma } from "../../database/prisma.client.js"
import type { Post } from "../../generated/prisma/index.js"
import type { CreatePostInput, UpdatePostInput } from "../../schemas/post.schema.js"
import { logger } from "../../utils/logger.util.js"

export class PostRepository {
    async findById(id: string): Promise<Post | null> {
        return prisma.post.findUnique({ 
            where: { id },
            include: {
                bannerImage: true,
                author: true,
                categories: {
                    include: {
                        category: true
                    }
                }
            }
        })
    }

    async findBySlug(slug: string): Promise<Post | null> {
        return prisma.post.findUnique({ 
            where: { slug },
            include: {
                bannerImage: true,
                author: true,
                categories: {
                    include: {
                        category: true
                    }
                }
            }
        })
    }

    async findAll(page: number, limit: number, authorId?: string, status?: string, categoryId?: string, sortBy: 'latest' | 'oldest' | 'popular' | 'trending' = 'latest', search?: string, authorSlug?: string, categorySlug?: string): Promise<Post[]> {
        const where: any = {
            ...(status ? { status: status as any } : {}),
            ...(search ? { searchText: { contains: search.toLowerCase() } } : {}),
        }

        if (authorId) where.authorId = authorId;
        if (authorSlug) where.author = { slug: authorSlug };

        if (categoryId || categorySlug) {
            where.categories = {
                some: {
                    ...(categoryId ? { categoryId } : {}),
                    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
                }
            }
        }

        const include = {
            author: true,
            categories: {
                include: {
                    category: true
                }
            },
            bannerImage: true
        }

        if (sortBy === 'popular') {
            return prisma.post.findMany({
                where,
                include,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    views: {
                        _count: 'desc'
                    }
                }
            })
        }

        if (sortBy === 'trending') {
            const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000)
            
            // For trending, we first find the post IDs with most views in last 72h
            const trendingViews = await prisma.postView.groupBy({
                by: ['postId'],
                _count: { _all: true },
                where: {
                    createdAt: { gte: seventyTwoHoursAgo },
                    post: where // Apply basic filters to views' posts
                },
                orderBy: {
                    _count: {
                        postId: 'desc'
                    }
                },
                take: limit
            })

            const trendingIds = trendingViews.map(v => v.postId)
            
            if (trendingIds.length === 0) {
                // Fallback to latest if no trending data yet
                return prisma.post.findMany({
                    where,
                    include,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                })
            }

            // Fetch posts in the specific ID order
            const posts = await prisma.post.findMany({
                where: {
                    id: { in: trendingIds },
                    ...where
                },
                include
            })

            // Sort posts according to the trending ID order
            return posts.sort((a, b) => trendingIds.indexOf(a.id) - trendingIds.indexOf(b.id))
        }

        return prisma.post.findMany({
            where,
            include,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                createdAt: sortBy === 'latest' ? 'desc' : 'asc'
            }
        })
    }

    async incrementView(postId: string, ipUaHash: string, dayString: string): Promise<void> {
        try {
            await prisma.postView.upsert({
                where: {
                    postId_dayString_ipUaHash: {
                        postId,
                        dayString,
                        ipUaHash
                    }
                },
                update: {}, // Do nothing if exists
                create: {
                    postId,
                    dayString,
                    ipUaHash
                }
            })
        } catch (err) {
            // Logically unique constraint might throw if race condition, 
            // but prisma.upsert handles it gracefully.
            logger.error("View increment error", { error: err })
        }
    }


    async create(authorId: string, data: CreatePostInput & { searchText: string, originalPostId?: string, pendingAction?: "EDIT_REQUEST" | "REMOVAL_REQUEST" | null }): Promise<Post> {
        const { imageIds, bannerImageId, categoryIds, originalPostId, pendingAction, ...postData } = data

        return prisma.post.create({
            data: {
                ...postData,
                slug: postData.slug!, // Ensured by service
                content: (postData.content ?? null) as any,
                htmlContent: postData.htmlContent || null,
                authorId,
                title: postData.title || "Untitled",
                excerpt: postData.excerpt || null,
                bannerImageId: bannerImageId || null,
                originalPostId: originalPostId || null,
                pendingAction: pendingAction || null,
                // Link categories
                ...(categoryIds?.length ? {
                    categories: {
                        create: categoryIds.map(id => ({ categoryId: id }))
                    }
                } : {}),
                // Link any pre-uploaded images to this post
                ...(imageIds?.length ? {
                    images: { connect: imageIds.map(id => ({ id })) }
                } : {}),
            }
        })
    }

    async update(slug: string, data: UpdatePostInput): Promise<Post> {
        const { imageIds, bannerImageId, categoryIds, ...postData } = data

        return prisma.post.update({
            where: { slug },
            data: {
                ...(postData as any),
                bannerImageId: bannerImageId !== undefined ? (bannerImageId || null) : undefined,
                // Sync categories
                ...(categoryIds !== undefined ? {
                    categories: {
                        deleteMany: {},
                        create: categoryIds.map(id => ({ categoryId: id }))
                    }
                } : {}),
                // Link any newly uploaded images to this post
                ...(imageIds?.length ? {
                    images: { connect: imageIds.map(id => ({ id })) }
                } : {}),
            }
        })
    }


    async delete(slug: string): Promise<boolean> {
        await prisma.post.delete({ where: { slug } })
        return true
    }

    async duplicateImage(imageId: string): Promise<string | null> {
        const img = await prisma.image.findUnique({ where: { id: imageId } })
        if (!img) return null;
        const newImg = await prisma.image.create({
            data: {
                url: img.url,
                cloudinaryPublicId: img.cloudinaryPublicId,
                alt: img.alt
            }
        });
        return newImg.id;
    }

    async getInternalSuggestions(postId: string, limit: number = 3): Promise<any[]> {
        // 1. Fetch source post context
        const sourcePost = await prisma.post.findUnique({
            where: { id: postId },
            include: { categories: true }
        })

        if (!sourcePost) return []

        const sourceCategoryIds = sourcePost.categories.map(c => c.categoryId)
        
        // 2. Extract significant keywords from title and content
        // We use the already generated searchText which now contains clean plain text
        const contentContext = (sourcePost.title + " " + (sourcePost.searchText || ""))
            .toLowerCase()
            .replace(/[^\w\s]/g, " ")
            .split(/\s+/)
            .filter(word => word.length > 4) // Ignore short/common words
        
        // Frequency map to find truly significant words
        const freqMap: Record<string, number> = {}
        contentContext.forEach(w => freqMap[w] = (freqMap[w] || 0) + 1)
        
        const topKeywords = Object.entries(freqMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8) // Use top 8 keywords for the initial database filter
            .map(e => e[0])

        if (topKeywords.length === 0 && sourceCategoryIds.length === 0) return []

        // 3. Query candidate posts
        const candidates = await prisma.post.findMany({
            where: {
                id: { not: postId },
                status: 'PUBLISHED',
                originalPostId: null,
                OR: [
                    // Shared category match
                    ...(sourceCategoryIds.length > 0 ? [{
                        categories: {
                            some: { categoryId: { in: sourceCategoryIds } }
                        }
                    }] : []),
                    // Text matches across title or content for any of the top keywords
                    ...topKeywords.map(k => ({
                        searchText: { contains: k, mode: 'insensitive' as const }
                    })),
                    ...topKeywords.slice(0, 3).map(k => ({
                        title: { contains: k, mode: 'insensitive' as const }
                    }))
                ]
            },
            include: {
                categories: true,
                author: true,
                bannerImage: true
            },
            take: 40 // Broad pool for refined ranking
        })

        // 4. Weighted Scoring Algorithm
        const scoredCandidates = candidates.map(p => {
            let categoryScore = 0
            let textScore = 0

            // Category match: +25 per shared category
            const candidateCatIds = p.categories.map(c => c.categoryId)
            const sharedCats = candidateCatIds.filter(id => sourceCategoryIds.includes(id))
            categoryScore = sharedCats.length * 25

            // Content keywords match: 
            // +15 for each top keyword in candidate's searchText
            // +30 for each top keyword in candidate's title (high relevance)
            const targetSearchText = (p.searchText || "").toLowerCase()
            const targetTitle = p.title.toLowerCase()

            topKeywords.forEach(k => {
                if (targetTitle.includes(k)) textScore += 30
                else if (targetSearchText.includes(k)) textScore += 15
            })

            return {
                id: p.id,
                title: p.title,
                slug: p.slug,
                excerpt: p.excerpt,
                bannerImageId: p.bannerImageId,
                bannerImage: p.bannerImage,
                author: p.author,
                categories: p.categories,
                category_score: categoryScore,
                text_score: textScore,
                score: Math.min(categoryScore + textScore, 100),
                publishedAt: p.publishedAt
            }
        })

        // 5. Final Sort and limit
        return scoredCandidates
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score
                const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
                const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
                return dateB - dateA
            })
            .slice(0, limit)
    }
}