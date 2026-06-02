import { CategoryFilter } from "../category-filter"
import { SortDropdown } from "../sort-dropdown"

export const Filters = () => {
    return (
        <div className="flex items-center justify-end mt-4">
            <div className="flex items-center gap-9">
                <CategoryFilter />
                <SortDropdown />
            </div>
        </div>
    )
}