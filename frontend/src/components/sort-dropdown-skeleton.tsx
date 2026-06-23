import { Skeleton } from "./dashboard/skeletons"

/**
 * SortDropdownSkeleton — Matches the exact dimensions of the SortDropdown component
 * to prevent cumulative layout shift (CLS) during Suspense loading.
 * 
 * Mirrors: icon (16px) + "Sort by:" label + select dropdown (px-3 py-1.5 ~34px height)
 */
export const SortDropdownSkeleton = () => (
    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <div className="flex items-center gap-1.5">
            {/* ArrowDownUp icon placeholder */}
            <Skeleton className="size-4 rounded-sm" />
            {/* "Sort by:" label */}
            <Skeleton className="h-4 w-[56px] rounded-sm" />
        </div>
        {/* Select dropdown: matches border px-3 py-1.5 pr-9 */}
        <Skeleton className="h-[34px] w-[120px] rounded-sm" />
    </div>
)
