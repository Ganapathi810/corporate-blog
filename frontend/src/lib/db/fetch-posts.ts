import * as Sentry from "@sentry/nextjs";

export async function fetchPosts(
    authorSlug: string,
    params: { search?: string; category?: string; sort?: string }
) {
    try {
        const query = new URLSearchParams({
            status: "PUBLISHED",
            limit: "20",
            sortBy: params.sort === "oldest" ? "oldest" : "latest",
            authorSlug,
        });
        if (params.category) query.append("categoryId", params.category);
        if (params.search) query.append("search", params.search);

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts?${query.toString()}`,
            { next: { revalidate: 900 } }
        );
        if (!res.ok) return [];
        const result = await res.json();
        return result.data || [];
    } catch (error) {
        Sentry.captureException(error)
        return [];
    }
}