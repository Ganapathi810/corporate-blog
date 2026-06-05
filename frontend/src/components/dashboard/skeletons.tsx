"use client"

import React from "react"

export const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:400%_100%] rounded-sm ${className}`} />
)

export const DashboardHeaderSkeleton = () => (
    <div className="flex items-center justify-between mb-8">
        <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
    </div>
)

export const StatsCardsSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl border border-gray-100 p-4 flex items-center gap-3 bg-white">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1">
                    <Skeleton className="h-6 w-12 mb-1.5" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        ))}
    </div>
)

export const TableSkeleton = ({ rows = 5, mode = "WRITER" }: { rows?: number; mode?: "WRITER" | "EDITOR" | "ADMIN_USERS" }) => {
    const isEditor = mode === "EDITOR"
    const isUsers = mode === "ADMIN_USERS"
    const cols = isEditor ? 5 : isUsers ? 4 : 4
    const tabs = isEditor ? [1, 2] : [1, 2, 3, 4, 5]

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
            {/* Tab Skeleton */}
            {!isUsers && (
                <div className="flex items-center gap-1 px-4 pt-4 border-b border-gray-200">
                    {tabs.map(i => (
                        <Skeleton key={i} className="h-9 w-24 rounded-t-md mr-1" />
                    ))}
                </div>
            )}
            
            {/* Content Skeleton */}
            <div className="p-0">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="px-5 py-3 text-left w-1/3"><Skeleton className="h-3 w-24" /></th>
                            {isEditor && <th className="px-4 py-3 text-left w-1/4"><Skeleton className="h-3 w-16" /></th>}
                            {!isUsers && <th className="px-4 py-3 text-left w-24"><Skeleton className="h-3 w-12" /></th>}
                            <th className="px-4 py-3 text-left w-32"><Skeleton className="h-3 w-16" /></th>
                            <th className="px-5 py-3 text-right w-24"><Skeleton className="h-3 w-12 ml-auto" /></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {[...Array(rows)].map((_, i) => (
                            <tr key={i}>
                                <td className="px-5 py-4">
                                    <Skeleton className="h-4 w-full max-w-[200px]" />
                                    <Skeleton className="h-3 w-32 mt-2 opacity-60" />
                                </td>
                                {isEditor && <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>}
                                <td className="px-4 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                                <td className="px-5 py-4"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export const EditorSkeleton = () => (
    <div className="max-w-6xl mx-auto pt-6 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between pt-6">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-4">
                <Skeleton className="h-4 w-24 self-center" />
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="px-[70px] py-8">
                {/* Title Area */}
                <div className="space-y-4 mb-8">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-4 w-64 opacity-50" />
                </div>

                {/* Banner Area */}
                <Skeleton className="h-48 md:h-64 w-full rounded-sm mb-10" />

                {/* Content Area */}
                <div className="space-y-6 pt-8">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full opacity-80" />
                    <Skeleton className="h-4 w-4/6" />
                    {/* Block Spacing Mock */}
                    <div className="h-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </div>
    </div>
)

export const DashboardPageSkeleton = () => (
    <div className="max-w-6xl mx-auto pt-6 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="pt-6">
            <DashboardHeaderSkeleton />
        </div>
        <StatsCardsSkeleton />
        <TableSkeleton rows={6} mode="WRITER" />
    </div>
)

export const BlogListSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Search Bar Skeleton */}
        <div className="mb-6">
            <Skeleton className="h-12 w-full rounded-full" />
        </div>

        {/* Filters Skeleton */}
        <div className="mb-12 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
            ))}
        </div>

        <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="space-y-4">
                        {/* Thumbnail */}
                        <Skeleton className="h-48 w-full rounded" />
                        
                        {/* Meta Row */}
                        <div className="flex gap-3 items-center">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-1 w-1 rounded-full" />
                            <Skeleton className="h-3 w-16" />
                        </div>

                        {/* Title & Excerpt */}
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-full rounded" />
                            <Skeleton className="h-4 w-5/6 rounded opacity-70" />
                            <Skeleton className="h-4 w-4/6 rounded opacity-70" />
                        </div>

                        {/* Author Row */}
                        <div className="flex items-center gap-2 pt-2">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
)

export const PostGridSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded" />
                <div className="flex gap-3 items-center">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-1 w-1 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-6 w-full rounded" />
                    <Skeleton className="h-4 w-5/6 rounded opacity-70" />
                    <Skeleton className="h-4 w-4/6 rounded opacity-70" />
                </div>
                <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        ))}
    </div>
)

export const BlogPostSkeleton = () => (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12 px-4 lg:px-0 mt-4">
        {/* Banner Skeleton */}
        <Skeleton className="w-full aspect-[21/9] md:aspect-[3/1] rounded-2xl shadow-sm" />
        
        <div className="grid grid-cols-12 gap-10">
            {/* Article Skeleton */}
            <article className="col-span-12 md:col-span-8">
                <div className="mb-8">
                    <Skeleton className="h-12 w-full mb-4" />
                    <Skeleton className="h-12 w-3/4 mb-10" />
                    
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                </div>
                
                <div className="space-y-5 pt-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <Skeleton key={i} className={`h-4 ${i % 3 === 0 ? 'w-4/5' : i % 2 === 0 ? 'w-full' : 'w-11/12'}`} />
                    ))}
                </div>
            </article>

            {/* Sidebar Skeleton */}
            <aside className="col-span-12 md:col-span-4 lg:block">
                <Skeleton className="h-[250px] w-full rounded-xl" />
                <div className="mt-8 space-y-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-40 w-full rounded-lg" />
                </div>
            </aside>
        </div>
    </div>
)
