"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import {
    Trash2, RefreshCw, Plus
} from "lucide-react"
import { Skeleton } from "@/components/dashboard/skeletons"
import { ConfirmModal } from "@/components/dashboard/shared"
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manage Categories | Dashboard",
    description: "Manage categories | Dashboard",
    robots: {
        index: false,
        follow: false,
    }
}
export default function CategoriesPage() {
    const { data: session, isPending } = useSession()
    const router = useRouter()
    const [categories, setCategories] = useState<{ id: string, name: string, slug: string }[]>([])
    const [newCategoryName, setNewCategoryName] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [confirmAction, setConfirmAction] = useState<{
        title: string; desc: string; onConfirm: () => void;
        variant?: "primary" | "danger"; label?: string;
    } | null>(null)

    useEffect(() => {
        if (!isPending && session?.user?.role?.toUpperCase() !== "ADMIN") {
            router.push("/dashboard")
        }
    }, [session, isPending, router])

    const fetchCategories = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories`)
            const data = await res.json()
            setCategories(data.data ?? [])
        } catch {
            toast.error("Failed to load categories")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { 
        if (!isPending && session) {
            fetchCategories() 
        }
    }, [isPending, session])

    const createCategory = async () => {
        if (!newCategoryName.trim()) return
        setIsActionLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newCategoryName }),
            })
            if (!res.ok) throw new Error()
            toast.success("Category created")
            setNewCategoryName("")
            fetchCategories()
        } catch {
            toast.error("Failed to create category")
        } finally {
            setIsActionLoading(false)
        }
    }

    const deleteCategory = async (id: string) => {
        setIsActionLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            if (!res.ok) throw new Error()
            toast.success("Category deleted")
            fetchCategories()
        } catch {
            toast.error("Failed to delete category")
        } finally {
            setIsActionLoading(false)
            setConfirmAction(null)
        }
    }

    if (isPending || !session) return (
        <div className="max-w-6xl mx-auto pt-6 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
        </div>
    )

    return (
        <div className="max-w-6xl mx-auto pt-6 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 pt-6">
                <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
                <p className="text-gray-500 text-sm mt-0.5">Organize your blog taxonomy and control global tags.</p>
            </div>

            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/[0.02]">
                    <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tighter opacity-70">
                         <Plus className="size-4 text-[#414BEA]" /> Create New Category
                    </h3>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="Category name (e.g. 📊 Finance or 💡 Insights)"
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && createCategory()}
                                className="w-full px-4 py-2.5  border border-blue-100 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-300"
                            />
                        </div>
                        <button 
                            onClick={createCategory}
                            disabled={isActionLoading || !newCategoryName.trim()}
                            className="cursor-pointer disabled:cursor-not-allowed px-8 py-2.5 bg-[#414BEA] text-white text-sm font-semibold rounded-sm hover:bg-[#3640cc] hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isActionLoading ? <RefreshCw className="size-4 animate-spin" /> : "Create Category"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="group bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300">
                            <div className="flex justify-between items-start mb-2 overflow-hidden">
                                <div className="font-bold text-gray-900 group-hover:text-[#414BEA] transition-colors truncate pr-2">{cat.name}</div>
                                <button 
                                    onClick={() => setConfirmAction({
                                        title: "Delete Category",
                                        desc: `Are you sure? This will remove the "${cat.name}" tag from all existing blogs.`,
                                        onConfirm: () => deleteCategory(cat.id),
                                        variant: "danger",
                                        label: "Delete"
                                    })}
                                    className="cursor-pointer p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                            <div className="text-[11px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 inline-block">
                                /{cat.slug}
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && !isLoading && (
                        <div className="col-span-full py-20 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 font-medium">
                            <Plus className="size-8 opacity-20 mb-3" />
                            No categories found. Start by creating one above.
                        </div>
                    )}
                    {isLoading && Array(6).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-xl border border-gray-100" />
                    ))}
                </div>
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
