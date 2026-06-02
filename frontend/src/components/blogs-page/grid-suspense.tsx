"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, ReactNode } from "react"
import { PostGridSkeleton } from "../dashboard/skeletons"

interface GridSuspenseProps {
    children: ReactNode
}

/**
 * GridSuspense — Production best practice for Next.js 15.
 * 
 * It uses a deterministic key derived from search parameters to ensure 
 * the Suspense boundary fallbacks (shimmer) trigger on every filter change, 
 * while maintaining a stable identity during other renders to avoid 
 * breaking user interactions like link clicks.
 */
export const GridSuspense = ({ children }: GridSuspenseProps) => {
    const searchParams = useSearchParams()
    
    // Create a stable key based on the relevant filter states
    // This triggers the shimmer ONLY when filters/search change.
    const filterKey = JSON.stringify({
        search: searchParams.get('search'),
        category: searchParams.get('category'),
        sort: searchParams.get('sort')
    })

    return (
        <Suspense key={filterKey} fallback={<PostGridSkeleton />}>
            {children}
        </Suspense>
    )
}
