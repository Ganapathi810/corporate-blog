import { PostsList } from "@/components/blogs-page/posts";
import { Filters } from "@/components/blogs-page/filters";
import { SearchBar } from "@/components/searchbar";
import { SearchBarSkeleton } from "@/components/searchbar-skeleton";
import { SchemaOrg } from "@/components/schema-org";
import { siteConfig, absoluteUrl } from "@/lib/seo.config";
import type { Metadata } from "next";
import * as Sentry from "@sentry/nextjs";
import { CategoryPostsClient } from "@/components/blogs-page/category-posts-client";
import { fetchPosts } from "@/lib/db/fetch-posts";
import { Suspense } from "react";
import { notFound } from "next/navigation";

export const revalidate = 900; // ISR: revalidate every 15 minutes

export async function generateStaticParams() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories`,
            { next: { revalidate: 900 } }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return (data.data || []).map((c: any) => ({ slug: c.slug }));
    } catch {
        return [];
    }
}

async function fetchCategory(slug: string) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories/slug/${slug}`,
            { next: { revalidate: 900 } }
        );
        if (!res.ok) return null;
        const result = await res.json();
        return result.data;
    } catch (error) {
        Sentry.captureException(error)
        return null;
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const slug = (await params).slug;
    const category = await fetchCategory(slug);

    if (!category) {
        notFound();
    }

    const canonicalUrl = absoluteUrl(`/blog/category/${slug}`);
    const title = `${category.name} Articles`;
    const description = `Browse all articles in the ${category.name} category on ${siteConfig.name}. Expert insights and industry knowledge on ${category.name}.`;

    return {
        title,
        description,
        keywords: [category.name, "corporate blog", "fintech", "industry insights"],
        alternates: { canonical: canonicalUrl },
        openGraph: {
            type: "website",
            url: canonicalUrl,
            title: `${title} | ${siteConfig.name}`,
            description,
            siteName: siteConfig.name,
            images: [{ url: absoluteUrl(siteConfig.ogImage), width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | ${siteConfig.name}`,
            description,
            images: [absoluteUrl(siteConfig.ogImage)],
        },
    };
}

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const categorySlug = (await params).slug;

    const categoryPromise = fetchCategory(categorySlug);
    const initialPostsPromise = fetchPosts(categorySlug, {}, "category");

    const [category, initialPosts] = await Promise.all([categoryPromise, initialPostsPromise]);

    if (!category) {
        notFound()
    }

    const canonicalUrl = absoluteUrl(`/blog/category/${categorySlug}`);

    const collectionPageSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${category.name} Articles`,
        description: `Browse all articles in the ${category.name} category on ${siteConfig.name}.`,
        url: canonicalUrl,
        publisher: {
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
        },
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.url}/blog` },
            { "@type": "ListItem", position: 3, name: category.name, item: canonicalUrl },
        ],
    };

    return (
        <div className="pb-20">
            <SchemaOrg schema={[collectionPageSchema, breadcrumbSchema]} />
            <Suspense fallback={<SearchBarSkeleton />}>
                <SearchBar />
            </Suspense>
            <Filters />
            <div className="mt-8">
                <h2 className="text-2xl font-semibold px-4 md:px-0 max-w-6xl mx-auto mb-6">
                    Articles related to{" "}
                    <span className="text-blue-600">{category.name}</span>
                </h2>
                <div className="max-w-6xl mx-auto px-4 md:px-0 min-h-[400px]">
                    <PostsList posts={initialPosts} />
                    <Suspense fallback={null}>
                            <CategoryPostsClient 
                                categorySlug={categorySlug}
                                initialPosts={initialPosts}
                            />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
