import { PostsList } from "@/components/blogs-page/posts";
import { Filters } from "@/components/blogs-page/filters";
import { SearchBar } from "@/components/searchbar";
import { BlogNotFound } from "@/components/blogs-page/blog-not-found";
import { SchemaOrg } from "@/components/schema-org";
import { siteConfig, absoluteUrl } from "@/lib/seo.config";
import type { Metadata } from "next";
import * as Sentry from "@sentry/nextjs";

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

async function fetchPosts(
    categorySlug: string,
    params: { search?: string; category?: string; sort?: string }
) {
    try {
        const query = new URLSearchParams({
            status: "PUBLISHED",
            limit: "20",
            sortBy: params.sort === "oldest" ? "oldest" : "latest",
        });

        if (params.category) {
            query.append("categoryId", params.category);
        } else {
            query.append("categorySlug", categorySlug);
        }

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

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const slug = (await params).slug;
    const category = await fetchCategory(slug);

    if (!category) {
        return {
            title: "Category Not Found",
            robots: { index: false, follow: false },
        };
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

async function CategoryPostsGrid({
    categorySlug,
    searchParamsPromise,
}: {
    categorySlug: string;
    searchParamsPromise: Promise<{ search?: string; category?: string; sort?: string }>;
}) {
    const params = await searchParamsPromise;
    const posts = await fetchPosts(categorySlug, params);
    const hasFilters = !!(params.search || params.category);
    return <PostsList posts={posts as any} hasFilters={hasFilters} />;
}

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ search?: string; category?: string; sort?: string }>;
}) {
    const categorySlug = (await params).slug;
    const category = await fetchCategory(categorySlug);

    if (!category) {
        return <BlogNotFound type="category" />;
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
            <SearchBar />
            <Filters />
            <div className="mt-8">
                <h2 className="text-2xl font-semibold px-4 md:px-0 max-w-6xl mx-auto mb-6">
                    Articles related to{" "}
                    <span className="text-blue-600">{category.name}</span>
                </h2>
                <div className="max-w-6xl mx-auto px-4 md:px-0 min-h-[400px]">
                        <CategoryPostsGrid
                            categorySlug={categorySlug}
                            searchParamsPromise={searchParams}
                        />
                </div>
            </div>
        </div>
    );
}
