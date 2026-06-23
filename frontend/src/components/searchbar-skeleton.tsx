import { Skeleton } from "./dashboard/skeletons"

/**
 * SearchBarSkeleton — Matches the exact dimensions of the SearchBar component
 * to prevent cumulative layout shift (CLS) during Suspense loading.
 * 
 * Mirrors: mt-4, mb-8, full-width, py-3 input height (~48px)
 */
export const SearchBarSkeleton = () => (
    <div className="mt-4 w-full mb-8">
        <div className="relative">
            {/* Matches the input: pl-10 pr-10 py-3 border rounded-sm = ~48px height */}
            <Skeleton className="w-full h-[48px] rounded-sm" />
        </div>
    </div>
)
