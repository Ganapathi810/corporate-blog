"use client"

import { useSearchParams } from "next/navigation";
import { PostsList } from "./posts";
import { Post } from "@/types/post";
import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { toast } from "sonner";
import { PostGridSkeleton } from "../dashboard/skeletons";


export function AuthorPostsClient({
    authorSlug,
    initialPosts,
}: {
    authorSlug: string;
    initialPosts: Post[];
}) {
    const [posts, setPosts] = useState(initialPosts);
    const [loading, setLoading] = useState(false);

    const searchParams = useSearchParams();
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "";

    const hasFilters = !!(search || category || sort);

    useEffect(() => {
        if(!hasFilters)  {
            setPosts(initialPosts);
            return;
        } 

        async function loadPosts() {
            try {
                setLoading(true);
                
                const query = new URLSearchParams({ 
                    status: "PUBLISHED", 
                    limit: "20", 
                    authorSlug, 
                    sortBy: sort === "oldest" ? "oldest" : "latest", 
                }); 
                    
                if (search) query.append("search", search); 
                if (category) query.append("categoryId", category);

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts?${query.toString()}`
                )

                if(!res.ok) {
                    throw new Error("Failed to fetch posts")
                }

                const result = await res.json()
                setPosts(result.data)
                setLoading(false);

            } catch (error) {
                Sentry.captureException(error)
                toast.error("Failed to load posts. Please try again later.")
                setLoading(false);
            }
        }

        loadPosts();
    },[search, category, sort, authorSlug, hasFilters])
    
    return loading ? <PostGridSkeleton /> : <PostsList posts={posts as any} hasFilters={hasFilters} />;
}