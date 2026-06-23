"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownUp, ChevronDown } from "lucide-react"

export const SortDropdown = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSortChange = (val: string) => {
        const params = new URLSearchParams(searchParams);
        if (val) {
            params.set('sort', val);
        } else {
            params.delete('sort');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const selectedSort = searchParams.get('sort') || "latest";

    return (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <label htmlFor="sort-filter" className="flex items-center gap-1.5">
                <ArrowDownUp className="size-4" />
                <span className="font-semibold">Sort by:</span>
            </label>
            <div className="relative group">
                <select 
                    id="sort-filter"
                    className="cursor-pointer border border-blue-300 rounded-sm px-3 py-1.5 pr-9 appearance-none bg-white font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all hover:bg-gray-50"
                    value={selectedSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                >
                    <option value="latest">Latest</option>
                    <option value="trending">Trending</option>
                    <option value="popular">Popular</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none size-4 text-gray-400" />
            </div>
        </div>
    )
}