"use client";

import * as Sentry from "@sentry/nextjs";

import { useState, useEffect, useRef } from "react"
import { NotionEditor } from "@/components/tiptap/notion-editor"
import { PostPreview } from "@/components/post-detail-page/post-preview"
import { Loader2, CheckCircle2, AlertCircle, Pencil, Eye } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSession } from "@/lib/auth-client"
import { EditorSkeleton } from "@/components/dashboard/skeletons"

export default function EditPostPage() {
    const params = useParams()
    const router = useRouter()
    const slugParam = params?.slug as string
    
    const [title, setTitle] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [slug, setSlug] = useState<string | null>("")
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(true)
    const [bannerUrl, setBannerUrl] = useState<string | null>(null)
    const [bannerImageId, setBannerImageId] = useState<string | null>(null)
    const [content, setContent] = useState<any>(null)
    const [htmlContent, setHtmlContent] = useState<string>("")
    const [categoryIds, setCategoryIds] = useState<string[]>([])
    const [categoryNames, setCategoryNames] = useState<{id: string, name: string}[]>([])
    const [showErrors, setShowErrors] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { data: session, isPending } = useSession()
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor")

    useEffect(() => {
        setMounted(true)
    }, [])

    const role = session?.user?.role?.toUpperCase() || "WRITER"
    const isWriter = role === "WRITER"
    
    // Status and IDs
    const [postId, setPostId] = useState<string | null>(null)
    const [isPublishing, setIsPublishing] = useState(false)
    const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVING" | "SAVED" | "ERROR">("IDLE")
    const [hasUserInteracted, setHasUserInteracted] = useState(false)
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
    const isInitialLoad = useRef(true)

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "")
    }

    // Fetch categories for preview display
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories`)
            .then(res => res.json())
            .then(data => {
                const allCats = data.data || []
                setCategoryNames(allCats)
            })
            .catch(() => {})
    }, [])

    // Fetch post data on mount
    useEffect(() => {
        const fetchPost = async () => {
            try {
                setIsLoading(true)
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${slugParam}`, {
                    credentials: 'include'
                })
                if (!response.ok) throw new Error("Failed to fetch post")
                
                const result = await response.json()
                const post = result.data
                
                setPostId(post.id)
                setTitle(post.title)
                setSlug(post.slug)
                setExcerpt(post.excerpt || "")
                setContent(post.content)
                if (post.bannerImage) {
                    setBannerUrl(post.bannerImage.url)
                    setBannerImageId(post.bannerImage.id)
                }
                if (post.categories) {
                    setCategoryIds(post.categories.map((c: any) => c.categoryId))
                }
            } catch (err) {
                Sentry.captureException(err)
                setError("Could not load post data. Please make sure the slug is correct.")
            } finally {
                setIsLoading(false)
            }
        }

        if (slugParam) fetchPost()
    }, [slugParam])

    const extractImageIds = (json: any): string[] => {
        const ids: string[] = []
        const find = (content: any) => {
            if (!content) return
            if (content.type === 'image' && content.attrs?.imageId) {
                ids.push(content.attrs.imageId)
            }
            if (content.content) {
                content.content.forEach(find)
            }
        }
        find(json)
        return ids
    }

    const handleAutoSave = async () => {
        if (!postId || !content) return

        setSaveStatus("SAVING")
        
        try {
            const imageIds = extractImageIds(content)

            const payload = {
                title: title.trim(),
                excerpt: excerpt.trim() ? excerpt.trim() : null,
                content,
                htmlContent: htmlContent || null,
                slug,
                ...(bannerImageId && { bannerImageId }),
                imageIds,
                categoryIds,
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${slugParam}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            })

            let data;
            try {
                data = await response.json()
            } catch (e) {
                // Ignore empty json response
            }

            if (!response.ok) {
                let errorMsg = "Auto-save failed"
                if (data?.message && typeof data.message === 'string') errorMsg = data.message;
                else if (data?.error) {
                    if (typeof data.error === 'string') errorMsg = data.error;
                    else if (data.error.message) errorMsg = data.error.message;
                    else errorMsg = JSON.stringify(data.error);
                }
                throw new Error(errorMsg)
            }

            if (slug && slug !== slugParam && data?.data?.slug === slug) {
                router.replace(`/dashboard/posts/${slug}/edit`)
            }

            setSaveStatus("SAVED")
            setTimeout(() => setSaveStatus("IDLE"), 2000)
        } catch (err: any) {
            Sentry.captureException(err)
            setSaveStatus("ERROR")
            toast.error("Failed to auto-save draft.")
        }
    }

    // Trigger auto-save when content changes (skip first render/load and wait for interaction)
    useEffect(() => {
        if (isLoading || !postId || !hasUserInteracted) return

        if (isInitialLoad.current) {
            isInitialLoad.current = false
            return
        }

        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)

        autoSaveTimerRef.current = setTimeout(handleAutoSave, 500)

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
        }
    }, [title, excerpt, content, bannerUrl, slug, categoryIds, isLoading, postId])

    const handlePublish = async () => {
        if (!postId || !title.trim() || !bannerUrl || !content?.content?.length || categoryIds.length === 0) {
            setShowErrors(true)
            const missing = []
            if (!title.trim()) missing.push("Title")
            if (!bannerUrl) missing.push("Banner")
            if (!content?.content?.length) missing.push("Content")
            if (categoryIds.length === 0) missing.push("at least one Category")
            
            toast.error(`Please provide: ${missing.join(", ")} before publishing!`)
            return
        }

        setIsPublishing(true)
        try {
            const status = isWriter ? "IN_REVIEW" : "PUBLISHED"

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${slugParam}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    title: title.trim(), 
                    excerpt: excerpt.trim() ? excerpt.trim() : null,
                    content,
                    htmlContent: htmlContent || null,
                    slug,
                    ...(bannerImageId && { bannerImageId }),
                    categoryIds,
                    status 
                }),
            })

            let data;
            try {
                data = await response.json()
            } catch (e) {
                // Ignore empty json 
            }

            if (!response.ok) {
                let errorMsg = "Publishing failed"
                if (data?.message && typeof data.message === 'string') errorMsg = data.message;
                else if (data?.error) {
                    if (typeof data.error === 'string') errorMsg = data.error;
                    else if (data.error.message) errorMsg = data.error.message;
                    else errorMsg = JSON.stringify(data.error);
                }
                throw new Error(errorMsg)
            }

            if (slug && slug !== slugParam) {
                router.replace(`/dashboard/posts/${slug}/edit`)
            }

            toast.success(isWriter ? "Post submitted for review successfully!" : "Post updated and published successfully!")
            router.push('/dashboard')
        } catch (err: any) {
            Sentry.captureException(err)
            toast.error(isWriter ? "Failed to submit post for review." : "Failed to update post.")
        } finally {
            setIsPublishing(false)
        }
    }

    // Resolve category IDs to display names for preview
    const selectedCategories = categoryNames.filter(c => categoryIds.includes(c.id))

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="p-3 rounded-full bg-red-50 text-red-500">
                    <AlertCircle className="size-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Error Loading Post</h2>
                <p className="text-gray-500">{error}</p>
            </div>
        )
    }

    if (!mounted || isLoading || isPending) return <EditorSkeleton />

    return (
        <div className="min-h-[85vh] max-w-7xl mx-auto pt-4 pb-10">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Post</h1>
                    
                    {/* Editor / Preview Tabs */}
                    <div className="flex bg-gray-100 rounded-sm p-0.5">
                        <button
                            onClick={() => setActiveTab("editor")}
                            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-sm transition-all cursor-pointer ${
                                activeTab === "editor"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <Pencil className="size-3.5" />
                            Editor
                        </button>
                        <button
                            onClick={() => setActiveTab("preview")}
                            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-sm transition-all cursor-pointer ${
                                activeTab === "preview"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <Eye className="size-3.5" />
                            Preview
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="text-sm font-medium flex items-center justify-center min-w-[100px] gap-2">
                        {saveStatus === "SAVING" && (
                            <>
                                <Loader2 className="size-4 animate-spin text-blue-600" />
                                <span className="text-blue-600">Saving...</span>
                            </>
                        )}
                        {saveStatus === "SAVED" && (
                            <>
                                <CheckCircle2 className="size-4 text-green-600" />
                                <span className="text-green-600">Saved</span>
                            </>
                        )}
                        {saveStatus === "ERROR" && (
                            <span className="text-red-500">Save failed</span>
                        )}
                    </div>
                    <button 
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="cursor-pointer px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isPublishing && <Loader2 className="size-4 animate-spin" />}
                        {isPublishing 
                            ? (isWriter ? "Submitting..." : "Publishing...") 
                            : (isWriter ? "Submit for Review" : "Update & Publish")}
                    </button>
                </div>
            </div>
            
            {/* Editor View */}
            {activeTab === "editor" && (
                <div className={`bg-white rounded-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] border border-gray-100 transition-colors duration-300`}>
                    <div 
                        onFocus={() => setHasUserInteracted(true)}
                        onClick={() => setHasUserInteracted(true)}
                        onKeyDown={() => setHasUserInteracted(true)}
                    >
                        <NotionEditor 
                            showErrors={showErrors}
                            slug={slug || ""}
                            onSlugChange={(newSlug) => {
                                setSlug(newSlug)
                                setIsSlugManuallyEdited(true)
                                setHasUserInteracted(true)
                            }}
                            key={postId} // Force re-render when post data is loaded
                            postId={postId}
                            title={title}
                            onTitleChange={(val) => {
                                setTitle(val)
                                setHasUserInteracted(true)
                                if (!isSlugManuallyEdited) {
                                    setSlug(generateSlug(val))
                                }
                                if (showErrors) setShowErrors(false)
                            }}
                            bannerUrl={bannerUrl}
                            onBannerChange={(url, imageId) => {
                                setBannerUrl(url)
                                if (imageId !== undefined) setBannerImageId(imageId || null)
                                setHasUserInteracted(true)
                                if (showErrors) setShowErrors(false)
                            }}
                            onUpdateContent={(json) => {
                                setContent(json)
                                setHasUserInteracted(true)
                                if (showErrors) setShowErrors(false)
                            }}
                            onUpdateHtmlContent={(html) => {
                                setHtmlContent(html)
                                setHasUserInteracted(true)
                            }}
                            initialContent={content}
                            categoryIds={categoryIds}
                            onCategoryIdsChange={(cats) => {
                                setCategoryIds(cats)
                                setHasUserInteracted(true)
                                if (showErrors) setShowErrors(false)
                            }}
                            excerpt={excerpt}
                            onExcerptChange={(val) => {
                                setExcerpt(val)
                                setHasUserInteracted(true)
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Preview View */}
            {activeTab === "preview" && (
                <div className="bg-white rounded-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden">
                    <PostPreview
                        title={title}
                        bannerUrl={bannerUrl}
                        content={content}
                        authorName={session?.user?.name || "Author"}
                        authorImage={session?.user?.image}
                        categories={selectedCategories}
                    />
                </div>
            )}
        </div>
    )
}