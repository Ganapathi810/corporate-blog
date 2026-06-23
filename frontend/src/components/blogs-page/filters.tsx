import { Category } from "@/types/Category";
import { CategoryFilter } from "../category-filter"
import { SortDropdown } from "../sort-dropdown"
import * as Sentry from "@sentry/nextjs";
import { Suspense } from "react";


async function fetchCategories(): Promise<Category[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories`)
        const data = await res.json()
        return data.data || []
    } catch(err) {
        Sentry.captureException(err)
        return []
    }
}

export const Filters = async () => {

    const categories = await fetchCategories()
    return (
        <div className="flex items-center justify-end mt-4">
            <div className="flex items-center gap-9">
                <Suspense fallback={<div>Loading category filter...</div>}>
                    <CategoryFilter categories={categories} />
                </Suspense>
                <Suspense fallback={<div>Loading sortBy filter...</div>}>
                    <SortDropdown />
                </Suspense>
            </div>
        </div>
    )
}