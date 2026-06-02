"use client"

import { UserX, Tag, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BlogNotFoundProps {
    type: "author" | "category"
    slug?: string
}

export const BlogNotFound = ({ type }: BlogNotFoundProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[50vh]">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-50 rounded-full scale-[1.8] opacity-50 blur-xl"></div>
                <div className="relative bg-white p-5 rounded-xl shadow-xl shadow-blue-500/5 border border-blue-50/50">
                    {type === "author" ? (
                        <UserX className="size-10 text-blue-600 stroke-[1.5]" />
                    ) : (
                        <Tag className="size-10 text-blue-600 stroke-[1.5]" />
                    )}
                </div>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                {type === "author" ? "Author not found" : "Category not found"}
            </h1>
            
            <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed text-sm">
                {type === "author" 
                    ? "The author you're looking for doesn't exist or has been removed. Check the URL or browse other articles."
                    : "The category you're looking for doesn't exist. It might have been renamed or deleted."}
            </p>
            
            <Link
                href="/blog"
                className="group flex items-center gap-2 px-6 py-2.5 bg-[#414BEA] text-white rounded-sm font-bold text-sm hover:bg-[#3640cc] transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] duration-200"
            >
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                Back to all blogs
            </Link>
        </div>
    )
}
