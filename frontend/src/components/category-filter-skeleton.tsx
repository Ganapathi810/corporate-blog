import { Skeleton } from "./dashboard/skeletons"

/**
 * CategoryFilterSkeleton — Matches the exact dimensions of the CategoryFilter component
 * to prevent cumulative layout shift (CLS) during Suspense loading.
 * 
 * Mirrors: icon (16px) + "Category:" label + select dropdown (px-3 py-1.5 ~34px height)
 */
export const CategoryFilterSkeleton = () => (
    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <div className="flex items-center gap-1.5">
            {/* Tag icon placeholder */}
            <Skeleton className="size-4 rounded-sm" />
            {/* "Category:" label */}
            <Skeleton className="h-4 w-[72px] rounded-sm" />
        </div>
        {/* Select dropdown: matches border px-3 py-1.5 pr-9 */}
        <Skeleton className="h-[34px] w-[160px] rounded-sm" />
    </div>
)
