"use client"
import * as Sentry from "@sentry/nextjs";

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { TrendingUp, BarChart3, ChevronRight, Clock } from "lucide-react"

interface MiniPost {
    id: string;
    title: string;
    slug: string;
    bannerImage?: { url: string };
    createdAt: string;
}

const WidgetItem = ({ post, index }: { post: MiniPost; index: number }) => (
    <Link 
        href={`/blog/${post.slug}`}
        className="group flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100"
    >
        <div className="relative shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-100">
            {post.bannerImage?.url ? (
                <img 
                    src={post.bannerImage.url} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#414BEA]/5 text-[#414BEA] font-bold text-xs">
                    {post.title[0]}
                </div>
            )}
            <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-sm text-[10px] font-black text-[#414BEA] shadow-sm">
                #{index + 1}
            </div>
        </div>
        <div className="flex flex-col justify-center gap-1.5 min-w-0">
            <h4 className="text-[13px] font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-[#414BEA] transition-colors">
                {post.title}
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                <Clock className="size-3" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    </Link>
)

const WidgetSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 p-3">
                <div className="w-16 h-16 bg-gray-100 rounded-md" />
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
            </div>
        ))}
    </div>
)

export const SidebarWidgets = () => {
    const [popular, setPopular] = useState<MiniPost[]>([])
    const [trending, setTrending] = useState<MiniPost[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [popRes, trendRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/popular?limit=3`),
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/trending?limit=3`)
                ])
                
                if (popRes.ok) {
                    const data = await popRes.json()
                    setPopular(data.data || [])
                }
                
                if (trendRes.ok) {
                    const data = await trendRes.json()
                    setTrending(data.data || [])
                }
            } catch (error) {
                Sentry.captureException(error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="flex flex-col gap-10">
            {/* Trending Widget */}
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 text-orange-600 rounded-sm">
                            <TrendingUp className="size-4" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Trending Now</h3>
                    </div>
                    <Link href="/blog?sort=trending" className="text-[10px] font-bold text-[#414BEA] hover:underline flex items-center gap-0.5 uppercase tracking-tighter">
                        View All <ChevronRight className="size-3" />
                    </Link>
                </div>
                <div className="p-2">
                    {loading ? <WidgetSkeleton /> : (
                        trending.length > 0 ? (
                            trending.map((post, idx) => (
                                <WidgetItem key={post.id} post={post} index={idx} />
                            ))
                        ) : (
                            <p className="p-6 text-center text-xs text-gray-400 italic">No trending data yet</p>
                        )
                    )}
                </div>
            </section>

            {/* Popular Widget */}
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 text-[#414BEA] rounded-sm">
                            <BarChart3 className="size-4" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Most Popular</h3>
                    </div>
                    <Link href="/blog?sort=popular" className="text-[10px] font-bold text-[#414BEA] hover:underline flex items-center gap-0.5 uppercase tracking-tighter">
                        View All <ChevronRight className="size-3" />
                    </Link>
                </div>
                <div className="p-2">
                    {loading ? <WidgetSkeleton /> : (
                        popular.length > 0 ? (
                            popular.map((post, idx) => (
                                <WidgetItem key={post.id} post={post} index={idx} />
                            ))
                        ) : (
                            <p className="p-6 text-center text-xs text-gray-400 italic">No activity yet</p>
                        )
                    )}
                </div>
            </section>
        </div>
    )
}
