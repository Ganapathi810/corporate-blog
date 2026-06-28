"use client";

import * as Sentry from "@sentry/nextjs";

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { 
    CheckCircle2, Clock, FileText, XCircle, 
    TrendingUp, Plus,
    Pencil, Trash2, PenLine, Send, RefreshCw,
    Eye, Check, X
} from "lucide-react"

import { 
    Post, 
    PostStatus, 
    PendingAction, 
    PostTableSection, 
    ConfirmModal 
} from "@/components/dashboard/shared"
import { 
    DashboardPageSkeleton, 
    StatsCardsSkeleton 
} from "@/components/dashboard/skeletons"

const DASHBOARD_CONTAINER = "max-w-6xl mx-auto pt-6 pb-12 px-4 sm:px-6 lg:px-8"

export default function OverviewPage() {
    const { data: session, isPending } = useSession()
    const router = useRouter()
    const [posts, setPosts] = useState<Post[]>([])
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        drafts: 0,
        inReview: 0,
        rejected: 0
    })
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("")
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [confirmAction, setConfirmAction] = useState<{
        title: string; desc: string; onConfirm: () => void;
        variant?: "primary" | "danger"; label?: string;
    } | null>(null)

    const fetchDashboardData = async () => {
        setIsLoading(true)
        try {
            const role = session?.user?.role?.toUpperCase()
            const params = new URLSearchParams({ limit: "100" })
            
            // Stats calculation:
            // - ADMIN & EDITOR: Fetch global data to calculate overview metrics.
            // - WRITER: Fetch local data.
            const statsParams = new URLSearchParams({ limit: "100" })
            if (role === "WRITER") {
                statsParams.set("authorId", session?.user?.id!)
            }
            
            const statsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts?${statsParams}`, { credentials: "include" })
            const statsData = await statsRes.json()
            const allPosts = statsData.data ?? []
            
            setStats({
                total: allPosts.length,
                published: allPosts.filter((p: any) => p.status === "PUBLISHED").length,
                inReview: allPosts.filter((p: any) => p.status === "IN_REVIEW").length,
                // Drafts/Rejected are LOCAL for Editor, but we fetched GLOBAL stats for them above.
                // We filter them manually here to ensure the count matches the private tab.
                drafts: allPosts.filter((p: any) => 
                    p.status === "DRAFT" && (role === "ADMIN" ? true : p.authorId === session?.user?.id)
                ).length,
                rejected: allPosts.filter((p: any) => 
                    p.status === "REJECTED" && (role === "ADMIN" ? true : p.authorId === session?.user?.id)
                ).length,
            })

            const tableParams = new URLSearchParams({ limit: "100" })
            if (role === "ADMIN") {
                if (activeTab) {
                    tableParams.set("status", activeTab)
                } else {
                    setPosts([])
                    setIsLoading(false)
                    return
                }
            } else if (role === "EDITOR") {
                // Editor: Mixed visibility
                // Global for oversight states, Local for personal work
                if (activeTab === "PUBLISHED" || activeTab === "IN_REVIEW") {
                    tableParams.set("status", activeTab)
                } else {
                    tableParams.set("authorId", session?.user?.id!)
                    if (activeTab) tableParams.set("status", activeTab)
                }
            } else {
                // Writer: Total local view
                tableParams.set("authorId", session?.user?.id!)
                if (activeTab) tableParams.set("status", activeTab)
            }

            const tableRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts?${tableParams}`, { credentials: "include" })
            const tableData = await tableRes.json()
            setPosts(tableData.data ?? [])

        } catch (error) {
            Sentry.captureException(error)
            toast.error("Failed to load dashboard data")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!isPending && session) {
            const role = session.user.role?.toUpperCase()
            if ((role === "ADMIN" || role === "EDITOR") && activeTab === "") {
                setActiveTab("PUBLISHED")
                return // Let the next cycle with activeTab="PUBLISHED" trigger the fetch
            }
            fetchDashboardData()
        }
    }, [session, isPending, activeTab])

    const updatePostStatus = async (slug: string, status: PostStatus, pendingAction?: PendingAction) => {
        setIsActionLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${slug}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status, ...(pendingAction ? { pendingAction } : { pendingAction: null }) }),
            })
            if (!res.ok) throw new Error("Failed to update post status")
            toast.success("Action successful")
            fetchDashboardData()
        } catch (error: any) {
            toast.error(error.message || "Failed to update status")
        } finally {
            setIsActionLoading(false)
            setConfirmAction(null)
        }
    }

    const deletePost = async (slug: string) => {
        setIsActionLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${slug}`, { method: "DELETE", credentials: "include" })
            if (!res.ok) throw new Error()
            toast.success("Post deleted")
            fetchDashboardData()
        } catch {
            toast.error("Failed to delete post")
        } finally {
            setIsActionLoading(false)
            setConfirmAction(null)
        }
    }

    const requestEdit = async (slug: string) => {
        setIsActionLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${slug}/request-edit`, { method: "POST", credentials: "include" })
            if (!res.ok) throw new Error("Failed to request edit")
            toast.success("Edit draft created")
            fetchDashboardData()
            setActiveTab("IN_REVIEW")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsActionLoading(false)
            setConfirmAction(null)
        }
    }

    if (isPending || !session) return <DashboardPageSkeleton />

    const role = session.user.role?.toUpperCase() || "WRITER"

    const cards = [
        { label: "Total Blogs", value: stats.total, icon: <FileText className="size-5 text-gray-400" />, color: "bg-gray-50 border-gray-200", hideFor: ["EDITOR"] },
        { label: "Published", value: stats.published, icon: <CheckCircle2 className="size-5 text-green-500" />, color: "bg-green-50 border-green-200" },
        { label: "In Review", value: stats.inReview, icon: <Clock className="size-5 text-amber-500" />, color: "bg-amber-50 border-amber-200" },
        { label: "Drafts", value: stats.drafts, icon: <TrendingUpIcon className="size-5 text-sky-500" />, color: "bg-sky-50 border-sky-200" },
        { label: "Rejected", value: stats.rejected, icon: <XCircle className="size-5 text-red-400" />, color: "bg-red-50 border-red-200" },
    ].filter(card => !card.hideFor?.includes(role))

    const getActions = (post: Post) => {
        if (role === "ADMIN" || role === "EDITOR") {
            if (post.status === "IN_REVIEW") {
                if (post.pendingAction === "EDIT_REQUEST") {
                    return [
                        { label: "Approve Link Edit", icon: <Check className="size-3.5" />, onClick: () => setConfirmAction({
                            title: "Approve Edit Request",
                            desc: "This will allow the author to edit this post.",
                            onConfirm: () => updatePostStatus(post.slug, "DRAFT"),
                            label: "Approve"
                        }), color: "text-green-600 hover:bg-green-50 font-bold" },
                        { label: "Reject Request", icon: <X className="size-3.5" />, onClick: () => setConfirmAction({
                            title: "Reject Edit Request",
                            desc: "Reject this request for now.",
                            onConfirm: () => updatePostStatus(post.slug, "REJECTED"),
                            variant: "danger",
                            label: "Reject"
                        }), color: "text-red-600 hover:bg-red-50 font-bold" },
                    ]
                }

                return [
                    { label: "Approve & Publish", icon: <Check className="size-3.5" />, onClick: () => setConfirmAction({
                        title: "Approve & Publish",
                        desc: "This post will be visible live immediately.",
                        onConfirm: () => updatePostStatus(post.slug, "PUBLISHED"),
                        label: "Publish"
                    }), color: "text-green-600 hover:bg-green-50 font-bold" },
                    { label: "Edit content", icon: <Pencil className="size-3.5" />, onClick: () => router.push(`/dashboard/posts/${post.slug}/edit`), color: "text-blue-600 hover:bg-blue-50 font-bold" },
                    { label: "Reject", icon: <X className="size-3.5" />, onClick: () => setConfirmAction({
                        title: "Reject Changes",
                        desc: "Send this back to the author?",
                        onConfirm: () => updatePostStatus(post.slug, "REJECTED"),
                        variant: "danger",
                        label: "Reject"
                    }), color: "text-red-500 hover:bg-red-50 font-bold" },
                ]
            }

            return [
                { label: "Edit", icon: <Pencil className="size-3.5" />, onClick: () => router.push(`/dashboard/posts/${post.slug}/edit`) },
                { label: "Delete", icon: <Trash2 className="size-3.5" />, onClick: () => setConfirmAction({
                    title: "Delete Content",
                    desc: `Are you sure you want to delete "${post.title}"?`,
                    onConfirm: () => deletePost(post.slug),
                    variant: "danger",
                    label: "Delete"
                }), danger: true },
            ]
        }

        // Writer/Editor actions
        switch (post.status) {
            case "DRAFT":
                return [
                    { label: "Edit", icon: <PenLine className="size-3.5" />, onClick: () => router.push(`/dashboard/posts/${post.slug}/edit`) },
                    { label: "Submit", icon: <Send className="size-3.5" />, onClick: () => setConfirmAction({
                        title: "Submit for Review",
                        desc: "Ready to submit this for editor review?",
                        onConfirm: () => updatePostStatus(post.slug, "IN_REVIEW"),
                        label: "Submit"
                    }) },
                    { label: "Delete", icon: <Trash2 className="size-3.5" />, onClick: () => setConfirmAction({
                        title: "Delete Post",
                        desc: "This action cannot be undone.",
                        onConfirm: () => deletePost(post.slug),
                        variant: "danger",
                        label: "Delete"
                    }), danger: true },
                ]
            case "PUBLISHED":
                const hasPendingDraft = posts.some(p => p.originalPostId === post.id);
                return [
                    { label: "View", icon: <Eye className="size-3.5" />, onClick: () => window.open(`/blog/${post.slug}`, "_blank") },
                    hasPendingDraft ? 
                    { label: "Edit Pending", icon: <Clock className="size-3.5 text-amber-500" />, onClick: () => {}, disabled: true }
                    : { label: "Request Edit", icon: <Pencil className="size-3.5" />, onClick: () => setConfirmAction({
                        title: "Request Edit",
                        desc: "This will create a draft for editing. Changes must be approved before publishing.",
                        onConfirm: () => requestEdit(post.slug),
                        label: "Request Edit"
                    }) },
                ]
            case "REJECTED":
                return [
                    { label: "Edit", icon: <PenLine className="size-3.5" />, onClick: () => router.push(`/dashboard/posts/${post.slug}/edit`) },
                    { label: "Resubmit", icon: <RefreshCw className="size-3.5" />, onClick: () => setConfirmAction({
                        title: "Resubmit",
                        desc: "Ready to submit again?",
                        onConfirm: () => updatePostStatus(post.slug, "IN_REVIEW"),
                        label: "Resubmit"
                    }) },
                ]
            default: return []
        }
    }

    return (
        <div className={DASHBOARD_CONTAINER}>
            <div className="flex items-center justify-between mb-8 pt-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Welcome back, {session.user.name.split(' ')[0]}. Here&apos;s what&apos;s happening.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/posts/new" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#414BEA] text-white text-sm font-medium rounded-sm hover:bg-[#3640cc] transition-colors shadow-sm">
                        <Plus className="size-4" /> New Blog
                    </Link>
                </div>
            </div>

            {isLoading && posts.length === 0 ? (
                <StatsCardsSkeleton />
            ) : (
                <div className={`grid grid-cols-2 sm:grid-cols-3 ${role === "EDITOR" ? "lg:grid-cols-4" : "lg:grid-cols-5"} gap-3 mb-8`}>
                    {cards.map(card => (
                        <div key={card.label} className={`rounded-xl border p-4 flex items-center gap-3 ${card.color}`}>
                            <div className="p-2 bg-white rounded-lg border border-inherit">
                                 {card.icon}
                            </div>
                            <div>
                                <div className="text-xl font-bold text-gray-900">{card.value}</div>
                                <div className="text-xs text-gray-500 font-medium">{card.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8">
                <PostTableSection 
                    isLoading={isLoading} 
                    posts={posts} 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    getActions={getActions} 
                    showAuthor={role === "ADMIN" || role === "EDITOR"}
                    customTabs={role === "ADMIN" ? [
                        { label: "Published Blogs", value: "PUBLISHED" },
                        { label: "Rejected Blogs", value: "REJECTED" },
                        { label: "Draft Blogs", value: "DRAFT" },
                        { label: "In Review", value: "IN_REVIEW" },
                    ] : role === "EDITOR" ? [
                        { label: "Published Blogs", value: "PUBLISHED" },
                        { label: "Drafts", value: "DRAFT" },
                        { label: "Waiting for Review", value: "IN_REVIEW" },
                        { label: "Rejected Blogs", value: "REJECTED" },
                    ] : undefined}
                />
            </div>

            <ConfirmModal 
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                isLoading={isActionLoading}
                title={confirmAction?.title || ""}
                description={confirmAction?.desc || ""}
                confirmLabel={confirmAction?.label}
                confirmVariant={confirmAction?.variant}
                onConfirm={() => confirmAction?.onConfirm()}
            />
        </div>
    )
}

function TrendingUpIcon({ className }: { className?: string }) {
    return <TrendingUp className={className} />
}