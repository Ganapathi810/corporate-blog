import { PostsList } from "@/components/blogs-page/posts";
import { Filters } from "@/components/blogs-page/filters";
import { SearchBar } from "@/components/searchbar";
import { GridSuspense } from "@/components/blogs-page/grid-suspense";
import { BlogNotFound } from "@/components/blogs-page/blog-not-found";
import { SchemaOrg } from "@/components/schema-org";
import { siteConfig, absoluteUrl } from "@/lib/seo.config";
import type { Metadata } from "next";
import * as Sentry from "@sentry/nextjs";
import { AuthorPostsClient } from "@/components/blogs-page/author-posts-client";
import { fetchPosts } from "@/lib/db/fetch-posts";
import { Suspense } from "react";

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


export default async function AuthorPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const authorSlug = (await params).slug;
    const author = await fetchAuthor(authorSlug);
    const intialPosts = await fetchPosts(authorSlug, {})

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
            <Suspense fallback={<div>Loading seach bar...</div>}>
                <SearchBar />
            </Suspense>
            <Filters />
            <div className="mt-8">
                <h2 className="text-2xl font-semibold px-4 md:px-0 max-w-6xl mx-auto mb-6">
                    Articles by <span className="text-blue-600">{author.name}</span>
                </h2>
                <div className="max-w-6xl mx-auto px-4 md:px-0 min-h-[400px]">
                    <Suspense fallback={<PostsList posts={intialPosts} />}>
                        <GridSuspense>
                            <AuthorPostsClient 
                                authorSlug={authorSlug}
                                initialPosts={intialPosts}
                            />
                        </GridSuspense>
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
