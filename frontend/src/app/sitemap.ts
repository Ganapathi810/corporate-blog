import { siteConfig } from "@/lib/seo.config";
import type { MetadataRoute } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function fetchAllPublishedPosts() {
    try {
        const res = await fetch(
            `${BACKEND_URL}/api/v1/posts?status=PUBLISHED&limit=1000`,
            { next: { revalidate: 900 } }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch {
        return [];
    }
}

async function fetchAllCategories() {
    try {
        const res = await fetch(`${BACKEND_URL}/api/v1/categories`, {
            next: { revalidate: 900 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch {
        return [];
    }
}

async function fetchAllAuthors() {
    try {
        const res = await fetch(`${BACKEND_URL}/api/v1/users`, {
            next: { revalidate: 900 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [posts, categories, authors] = await Promise.all([
        fetchAllPublishedPosts(),
        fetchAllCategories(),
        fetchAllAuthors(),
    ]);

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: siteConfig.url,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${siteConfig.url}/blog`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
    ];

    // Blog post routes
    const postRoutes: MetadataRoute.Sitemap = posts.map((post: any) => ({
        url: `${siteConfig.url}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.createdAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }));

    // Category routes
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat: any) => ({
        url: `${siteConfig.url}/blog/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
    }));

    // Author routes
    const authorRoutes: MetadataRoute.Sitemap = authors
        .filter((author: any) => author.slug)
        .map((author: any) => ({
            url: `${siteConfig.url}/blog/author/${author.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.5,
        }));

    return [...staticRoutes, ...postRoutes, ...categoryRoutes, ...authorRoutes];
}
