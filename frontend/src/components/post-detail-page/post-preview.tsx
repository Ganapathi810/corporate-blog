"use client"

import { PostContent } from "@/components/post-detail-page/post-content"
import { Clock, Tag, User, Calendar } from "lucide-react"
import { calculateReadTime } from "@/lib/read-time"

interface PostPreviewProps {
    title: string
    bannerUrl: string | null
    content: any
    htmlContent?: string
    authorName: string
    authorImage?: string | null
    categories: { id: string; name: string }[]
    createdAt?: string
}

export const PostPreview = ({
    title,
    bannerUrl,
    content,
    htmlContent,
    authorName,
    authorImage,
    categories,
    createdAt,
}: PostPreviewProps) => {
    const date = new Date(createdAt || Date.now()).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })

    const readTime = calculateReadTime(content)

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-10 pb-12 px-4 lg:px-0 mt-8">
            {/* Title */}
            <header className="mb-2">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
                    {title || "Untitled Post"}
                </h1>
            </header>

            {/* Banner */}
            {bannerUrl && (
                <div className="w-full aspect-21/10 md:aspect-21/9 relative rounded-xl overflow-hidden shadow-2xl group border border-gray-100/50">
                    <img
                        src={bannerUrl}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 items-end gap-6 md:gap-8 text-white/90">
                            {/* Author */}
                            <div className="flex flex-col gap-2.5">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 flex items-center gap-1.5">
                                    <User className="size-2.5" /> Written by
                                </span>
                                <div className="flex items-center gap-3">
                                    {authorImage ? (
                                        <img
                                            src={authorImage}
                                            alt={authorName}
                                            className="size-10 rounded-full border border-white/20 object-cover"
                                        />
                                    ) : (
                                        <div className="size-10 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold border border-white/20">
                                            {authorName?.[0] || "U"}
                                        </div>
                                    )}
                                    <span className="font-semibold text-base md:text-lg line-clamp-1">
                                        {authorName || "System"}
                                    </span>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="flex flex-col gap-2.5">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 flex items-center gap-1.5">
                                    <Calendar className="size-2.5" /> Published on
                                </span>
                                <span className="font-semibold text-base md:text-lg line-clamp-1">
                                    {date}
                                </span>
                            </div>

                            {/* Read time */}
                            <div className="flex flex-col gap-2.5">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 flex items-center gap-1.5">
                                    <Clock className="size-2.5" /> Duration
                                </span>
                                <span className="font-semibold text-base md:text-lg">
                                    {readTime} min read
                                </span>
                            </div>

                            {/* Categories */}
                            <div className="flex flex-col gap-2.5 md:items-end col-span-2 md:col-span-1 border-t border-white/10 pt-4 md:pt-0 md:border-none w-full">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 flex items-center gap-1.5 md:justify-end">
                                    <Tag className="size-2.5" /> Category
                                </span>
                                <div className="flex flex-wrap md:justify-end gap-2">
                                    {categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <span
                                                key={cat.id}
                                                className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-sm text-[10px] md:text-xs font-bold border border-white/10 ring-1 ring-white/5 whitespace-nowrap"
                                            >
                                                {cat.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-sm text-[10px] md:text-xs font-bold border border-white/10 ring-1 ring-white/5 whitespace-nowrap opacity-50">
                                            No category
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="grid grid-cols-12 gap-10">
                <article className="col-span-12 md:col-span-8 lg:col-span-8 text-lg leading-relaxed text-gray-800">
                    {htmlContent ? (
                        <PostContent htmlContent={htmlContent} />
                    ) : (
                        <p className="text-gray-400 italic">Start writing to see the preview...</p>
                    )}
                </article>

                <aside className="col-span-12 md:col-span-4 lg:col-span-4 flex flex-col gap-8">
                    <div className="sticky top-8">
                        <div className="h-[350px] w-full rounded-sm overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                            <span className="text-xs text-gray-400 font-medium">Ad Space</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}
