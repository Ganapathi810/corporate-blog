import { PostsList } from "@/components/blogs-page/posts";
import { Filters } from "@/components/blogs-page/filters";
import { SearchBar } from "@/components/searchbar";
import { GridSuspense } from "@/components/blogs-page/grid-suspense";
import { BlogNotFound } from "@/components/blogs-page/blog-not-found";
import { SchemaOrg } from "@/components/schema-org";
import { siteConfig, absoluteUrl } from "@/lib/seo.config";
import type { Metadata } from "next";
import * as Sentry from "@sentry/nextjs";

export const revalidate = 900; // ISR: revalidate every 15 minutes

export async function generateStaticParams() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
            { next: { revalidate: 900 } }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return (data.data || [])
            .filter((u: any) => u.slug)
            .map((u: any) => ({ slug: u.slug }));
    } catch {
        return [];
    }
}

async function fetchAuthor(slug: string) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/slug/${slug}`,
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

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const slug = (await params).slug;
    const author = await fetchAuthor(slug);

    if (!author) {
        return {
            title: "Author Not Found",
            robots: { index: false, follow: false },
        };
    }

    const canonicalUrl = absoluteUrl(`/blog/author/${slug}`);
    const title = `Articles by ${author.name}`;
    const description = `Explore all articles written by ${author.name} on ${siteConfig.name}. In-depth insights, expert perspectives, and industry knowledge.`;

    return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            type: "profile",
            url: canonicalUrl,
            title: `${title} | ${siteConfig.name}`,
            description,
            siteName: siteConfig.name,
            images: author.image
                ? [{ url: author.image, width: 400, height: 400, alt: author.name }]
                : [{ url: absoluteUrl(siteConfig.ogImage), width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary",
            title: `${title} | ${siteConfig.name}`,
            description,
            images: author.image ? [author.image] : [absoluteUrl(siteConfig.ogImage)],
        },
    };
}

async function AuthorPostsGrid({
    authorSlug,
    searchParamsPromise,
}: {
    authorSlug: string;
    searchParamsPromise: Promise<{ search?: string; category?: string; sort?: string }>;
}) {
    const params = await searchParamsPromise;
    const posts = await fetchPosts(authorSlug, params);
    const hasFilters = !!(params.search || params.category);
    return <PostsList posts={posts as any} hasFilters={hasFilters} />;
}

export default async function AuthorPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ search?: string; category?: string; sort?: string }>;
}) {
    const authorSlug = (await params).slug;
    const author = await fetchAuthor(authorSlug);

    if (!author) {
        return <BlogNotFound type="author" />;
    }

    const canonicalUrl = absoluteUrl(`/blog/author/${authorSlug}`);

    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: author.name,
        url: canonicalUrl,
        image: author.image || undefined,
        worksFor: {
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
            { "@type": "ListItem", position: 3, name: author.name, item: canonicalUrl },
        ],
    };

    return (
        <div className="pb-20">
            <SchemaOrg schema={[personSchema, breadcrumbSchema]} />
            <SearchBar />
            <Filters />
            <div className="mt-8">
                <h2 className="text-2xl font-semibold px-4 md:px-0 max-w-6xl mx-auto mb-6">
                    Articles by <span className="text-blue-600">{author.name}</span>
                </h2>
                <div className="max-w-6xl mx-auto px-4 md:px-0 min-h-[400px]">
                    <GridSuspense>
                        <AuthorPostsGrid authorSlug={authorSlug} searchParamsPromise={searchParams} />
                    </GridSuspense>
                </div>
            </div>
        </div>
    );
}
