import { PostGridSkeleton } from "@/components/dashboard/skeletons";

export default function Loading() {
    return (
        <div className="pb-20">
            <div className="mt-4 w-full mb-8 h-[48px] rounded-sm bg-gray-100 animate-pulse" />
            <div className="flex justify-end mt-4 gap-9 h-[34px]" />
            <div className="mt-8 max-w-6xl mx-auto px-4">
                <div className="h-8 w-48 mb-6 bg-gray-100 animate-pulse rounded" />
                <PostGridSkeleton />
            </div>
        </div>
    )
}