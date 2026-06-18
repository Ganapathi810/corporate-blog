"use client";

import * as Sentry from "@sentry/nextjs";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Tag } from "lucide-react"
import { useEffect, useState } from "react"

export const CategoryFilter = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    
    const [categories, setCategories] = useState<{id: string, name: string, slug: string}[]>([]);
    
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories`)
            .then(res => res.json())
            .then(data => {
                console.log(JSON.stringify(data.data))
                setCategories(data.data || [])
            })
            .catch(err => Sentry.captureException(err));
    }, []);

    const isCategoryPage = pathname.startsWith('/blog/category/');
    const currentCategorySlug = isCategoryPage ? pathname.split('/').pop() : null;

    const handleCategoryChange = (id: string) => {
        const selectedCat = categories.find(c => c.id === id);
        
        if (isCategoryPage) {
            if (id) {
                // Redirect to the new category page
                router.push(`/blog/category/${selectedCat?.slug}`);
            } else {
                // Redirect back to main blog page
                router.push('/blog');
            }
            return;
        }

        const params = new URLSearchParams(searchParams);
        if (id) {
            params.set('category', id);
        } else {
            params.delete('category');
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    // Determine current selected value for the dropdown
    let selectedValue = searchParams.get('category') || "";
    if (isCategoryPage && currentCategorySlug && categories.length > 0) {
        const cat = categories.find(c => c.slug === currentCategorySlug);
        if (cat) selectedValue = cat.id;
    }

    return (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <div className="flex items-center gap-1.5 opacity-60">
                <Tag className="size-4" />
                <span>Category:</span>
            </div>
            <div className="relative group">
                <select 
                    className="cursor-pointer border border-blue-300 rounded-sm px-3 py-1.5 pr-9 appearance-none bg-white font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all hover:bg-gray-50"
                    value={selectedValue} 
                    onChange={(e) => handleCategoryChange(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none size-4 text-gray-400" />
            </div>
        </div>
    )
}
