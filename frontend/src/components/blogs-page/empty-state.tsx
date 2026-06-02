"use client"

import { SearchX, Inbox } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

interface EmptyStateProps {
    hasFilters: boolean
}

export const EmptyState = ({ hasFilters }: EmptyStateProps) => {
    const router = useRouter()
    const pathname = usePathname()

    const handleClearFilters = () => {
        router.push(pathname)
    }

    return (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center min-h-[400px]">
            <div className="mb-6">
                {hasFilters ? (
                    <SearchX className="size-10 text-blue-500/80 stroke-[1.5]" />
                ) : (
                    <Inbox className="size-10 text-slate-400 stroke-[1.5]" />
                )}
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
                {hasFilters ? "No matches found" : "No blogs yet"}
            </h3>
            
            <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed text-sm">
                {hasFilters 
                    ? "We couldn't find any blogs matching your search. Try adjusting your criteria or reset the filters."
                    : "No published blogs to display. Please check back later for new content."}
            </p>
            
            {hasFilters && (
                <button
                    onClick={handleClearFilters}
                    className="group flex items-center gap-2 px-6 py-2.5 bg-[#525CEB] text-white rounded-sm font-semibold text-sm hover:bg-[#3F49D0] transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] duration-200 cursor-pointer"
                >
                    Clear all filters
                </button>
            )}
        </div>
    )
}
