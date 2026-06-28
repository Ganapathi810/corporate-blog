"use client";

import * as Sentry from "@sentry/nextjs";

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { NotionEditor } from "@/components/tiptap/notion-editor"
import { PostPreview } from "@/components/post-detail-page/post-preview"
import { Loader2, CheckCircle2, Pencil, Eye } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "@/lib/auth-client"
import { Metadata } from "next";



export default function CreatePostPage() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [bannerUrl, setBannerUrl] = useState<string | null>(null)
    const [bannerImageId, setBannerImageId] = useState<string | null>(null)
    const [content, setContent] = useState<any>(null)
    const [htmlContent, setHtmlContent] = useState<string>("");
    const [categoryIds, setCategoryIds] = useState<string[]>([])
    const [categoryNames, setCategoryNames] = useState<{id: string, name: string}[]>([])
    const [showErrors, setShowErrors] = useState(false)
    const { data: session, isPending } = useSession()
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor")

    useEffect(() => {
        setMounted(true)
    }, [])

    const role = session?.user?.role?.toUpperCase() || "WRITER"
    const isWriter = role === "WRITER"
    
    // Auto-save states
    const [postId, setPostId] = useState<string | null>(null)
    const [slug, setSlug] = useState<string | null>("")
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
    const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVING" | "SAVED" | "ERROR">("IDLE")
    const [isPublishing, setIsPublishing] = useState(false)
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Fetch categories for preview display
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories`)
            .then(res => res.json())
            .then(data => setCategoryNames(data.data || []))
            .catch(() => {})
    }, [])

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "")
    }

    const generateInitialSlug = (text: string) => {
        return generateSlug(text) || "untitled"
    }

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
        // Only skip if entirely blank
        if (!title.trim() && !content?.content?.length && !bannerUrl) return

        // If post is already created, stop saving here and let the redirect to edit page complete
        if (postId) return;

        setSaveStatus("SAVING")
        
        try {
            const currentSlug = isSlugManuallyEdited ? (slug || generateSlug(title)) : generateInitialSlug(title)
            const imageIds = extractImageIds(content)
            
            const payload = {
                title: title.trim(),
                excerpt: excerpt.trim() ? excerpt.trim() : null,
                content: content || {},
                htmlContent: htmlContent || null,
                ...(bannerUrl && { bannerUrl }),
                ...(bannerImageId && { bannerImageId }),
                slug: currentSlug,
                imageIds,
                categoryIds,
            }

            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts`
            const method = 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            })

            let data;
            try {
                data = await response.json()
            } catch (e) {
                throw new Error(response.statusText || "Invalid server response")
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

            setPostId(data.data.id)
            setSlug(data.data.slug)
            
            router.replace(`/dashboard/posts/${data.data.slug}/edit`)
            
            setSaveStatus("SAVED")
            setTimeout(() => setSaveStatus("IDLE"), 2000)
        } catch (error: any) {
            Sentry.captureException(error)
            setSaveStatus("ERROR")
            toast.error("Failed to auto-save draft.")
        }
    }

    useEffect(() => {
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)

        // Trigger save whenever they stop typing (500ms debounce)
        autoSaveTimerRef.current = setTimeout(handleAutoSave, 500)

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
        }
    }, [title, excerpt, content, bannerUrl, slug, categoryIds])

    const handlePublish = async () => {
        if (!title.trim() || !bannerUrl || !content?.content?.length || categoryIds.length === 0) {
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
            // Update status to PUBLISHED
            const idToUpdate = postId
            const currentSlug = idToUpdate ? slug : (isSlugManuallyEdited ? (slug || generateSlug(title)) : generateInitialSlug(title))
            const url = idToUpdate 
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${slug}`
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts`
            
            const method = idToUpdate ? 'PATCH' : 'POST'
            
            const status = isWriter ? "IN_REVIEW" : "PUBLISHED"

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    title, 
                    excerpt: excerpt.trim() ? excerpt.trim() : null,
                    content,
                    htmlContent: htmlContent || null,
                    ...(bannerUrl && { bannerUrl }),
                    ...(bannerImageId && { bannerImageId }),
                    slug: currentSlug,
                    categoryIds,
                    status 
                }),
            })

            let data;
            try {
                data = await response.json()
            } catch (e) {
                // Ignore missing JSON on success/failure if it's empty
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

            toast.success(isWriter ? "Post submitted for review successfully!" : "Post created and published successfully!")
            router.push('/dashboard')
        } catch (err: any) {
            Sentry.captureException(err)
            toast.error(isWriter ? "Failed to submit post for review." : "Failed to publish post.")
        } finally {
            setIsPublishing(false)
        }
    }

    // Resolve category IDs to display names for preview
    const selectedCategories = categoryNames.filter(c => categoryIds.includes(c.id))

    if (!mounted || isPending) return null

    return (
        <div className="min-h-[85vh] max-w-5xl mx-auto pt-4 pb-10">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Post</h1>

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

                <div className="flex items-center gap-4">
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
                            : (isWriter ? "Submit for Review" : "Publish")}
                    </button>
                    </div>
                </div>
            </div>
            
            {/* Editor View */}
            {activeTab === "editor" && (
                <div className={`bg-white rounded-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] border border-gray-100 transition-colors duration-300`}>
                    <NotionEditor 
                        showErrors={showErrors}
                        slug={slug}
                        onSlugChange={(newSlug) => {
                            setSlug(newSlug)
                            setIsSlugManuallyEdited(true)
                        }}
                        postId={postId}
                        title={title}
                        onTitleChange={(val) => {
                            setTitle(val)
                            if (!isSlugManuallyEdited) {
                                setSlug(generateSlug(val))
                            }
                            if (showErrors) setShowErrors(false)
                        }}
                        bannerUrl={bannerUrl}
                        onBannerChange={(url, imageId) => {
                            setBannerUrl(url)
                            if (imageId) setBannerImageId(imageId)
                            if (showErrors) setShowErrors(false)
                        }}
                        onUpdateContent={setContent}
                        onUpdateHtmlContent={setHtmlContent}
                        categoryIds={categoryIds}
                        onCategoryIdsChange={setCategoryIds}
                        excerpt={excerpt}
                        onExcerptChange={setExcerpt}
                    />
                </div>
            )}

            {/* Preview View */}
            {activeTab === "preview" && (
                <div className="bg-white rounded-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100 px-6 py-3 bg-gray-50/50">
                        <p className="text-xs text-gray-400 font-medium">
                            This is a preview of how your blog post will appear to readers after publishing.
                        </p>
                    </div>
                    <PostPreview
                        title={title}
                        bannerUrl={bannerUrl}
                        content={content}
                        htmlContent={htmlContent}
                        authorName={session?.user?.name || "Author"}
                        authorImage={session?.user?.image}
                        categories={selectedCategories}
                    />
                </div>
            )}
        </div>
    )
}