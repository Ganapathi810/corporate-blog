import { PostsList } from "@/components/blogs-page/posts";
import { Filters } from "@/components/blogs-page/filters";
import { SearchBar } from "@/components/searchbar";
import { SchemaOrg } from "@/components/schema-org";
import type { Metadata } from "next";
import { siteConfig, absoluteUrl } from "@/lib/seo.config";
import * as Sentry from "@sentry/nextjs";

export const revalidate = 900; // ISR: revalidate every 15 minutes

export const metadata: Metadata = {
    title: "Blog",
    description: `Explore the latest articles, company updates, and expert insights on ${siteConfig.name}.`,
    alternates: {
        canonical: `${siteConfig.url}/blog`,
    },
    openGraph: {
        type: "website",
        url: `${siteConfig.url}/blog`,
        title: `Blog | ${siteConfig.name}`,
        description: `Explore the latest articles, company updates, and expert insights on ${siteConfig.name}.`,
        siteName: siteConfig.name,
        images: [
            {
                url: absoluteUrl(siteConfig.ogImage),
                width: 1200,
                height: 630,
                alt: `${siteConfig.name} Blog`,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: `Blog | ${siteConfig.name}`,
        description: `Explore the latest articles, company updates, and expert insights on ${siteConfig.name}.`,
        images: [absoluteUrl(siteConfig.ogImage)],
    },
};

async function fetchPosts(params: { search?: string; category?: string; sort?: string }) {
    try {
        const query = new URLSearchParams({
            status: "PUBLISHED",
            limit: "20",
            sortBy: params.sort || "latest",
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

async function BlogsGrid({
    searchParamsPromise,
}: {
    searchParamsPromise: Promise<{ search?: string; category?: string; sort?: string }>;
}) {
    const params = await searchParamsPromise;
    const posts = await fetchPosts(params);
    const hasFilters = !!(params.search || params.category);
    return <PostsList posts={posts as any} hasFilters={hasFilters} />;
}

const blogListingSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteConfig.name} Blog`,
    url: `${siteConfig.url}/blog`,
    description: `Explore the latest articles, company updates, and expert insights on ${siteConfig.name}.`,
    publisher: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
    },
};

const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": siteConfig.url,
    "potentialAction": {
        "@type": "SearchAction",
        "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${siteConfig.url}/blog?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
    }
};

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteConfig.url,
        },
        {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${siteConfig.url}/blog`,
        },
    ],
};

export default function BlogsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; category?: string; sort?: string }>;
}) {
    return (
        <div className="pb-20 w-full">
            <SchemaOrg schema={[blogListingSchema, breadcrumbSchema, websiteSchema]} />
            <SearchBar />
            <Filters />
            <div className="mt-8 w-full">
                <h2 className="text-2xl font-semibold px-4 md:px-0 max-w-6xl mx-auto mb-6">
                    Blogs
                </h2>
                <div className="w-full max-w-6xl mx-auto px-4 md:px-0 min-h-[400px]">
                        <BlogsGrid searchParamsPromise={searchParams} />
                </div>
            </div>
        </div>
    );
}