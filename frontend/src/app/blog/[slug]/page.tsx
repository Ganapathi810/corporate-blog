import { PostContent } from "@/components/post-detail-page/post-content";
import { PostLayout } from "@/components/post-detail-page/post-layout";
import { RelatedPosts } from "@/components/post-detail-page/related-posts";
import { ViewCounter } from "@/components/post-detail-page/view-counter";
import { SchemaOrg } from "@/components/schema-org";
import { siteConfig, absoluteUrl } from "@/lib/seo.config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

export const revalidate = 900; // ISR: revalidate every 15 minutes

async function getPostBySlug(slug: string) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${slug}`,
            { next: { revalidate: 900 } }
        );
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error("Failed to fetch post");
        }
        const result = await response.json();
        return result.data;
    } catch (error) {
        Sentry.captureException(error)
        return null;
    }
}

async function getRelatedPosts(postId: string) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${postId}/internal-suggestions`,
            { next: { revalidate: 900 } }
        );
        if (!response.ok) return [];
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        Sentry.captureException(error)
        return [];
    }
}

export async function generateStaticParams() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts?status=PUBLISHED&limit=1000`,
            { next: { revalidate: 900 } }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return (data.data || []).map((post: any) => ({ slug: post.slug }));
    } catch {
        return [];
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    console.log("Metadata for post page")
    const slug = (await params).slug;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound()
    }

    const canonicalUrl = absoluteUrl(`/blog/${slug}`);
    const ogImage = post.bannerImage?.url || absoluteUrl(siteConfig.ogImage);
    const categories = post.categories?.map((c: any) => c.category?.name).filter(Boolean) || [];
    const authorName = post.author?.name || siteConfig.author.name;
    const publishedTime = new Date(post.createdAt).toISOString();
    const modifiedTime = new Date(post.updatedAt || post.createdAt).toISOString();

    

    return {
        title: post.title,
        description: post.excerpt || `Read ${post.title} on ${siteConfig.name}`,
        keywords: categories,
        authors: [
            {
                name: authorName,
                url: post.author?.slug ? absoluteUrl(`/blog/author/${post.author.slug}`) : undefined,
            },
        ],
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: "article",
            url: canonicalUrl,
            title: post.title,
            description: post.excerpt || `Read ${post.title} on ${siteConfig.name}`,
            siteName: siteConfig.name,
            locale: siteConfig.locale,
            publishedTime,
            modifiedTime,
            authors: authorName ? [authorName] : undefined,
            section: categories[0] || "Blog",
            tags: categories,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            site: siteConfig.twitterHandle,
            creator: siteConfig.twitterHandle,
            title: post.title,
            description: post.excerpt || `Read ${post.title} on ${siteConfig.name}`,
            images: [ogImage],
        },
    };
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const slug = (await params).slug;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    console.log("fetched post : \n",JSON.stringify(post,null,2))

    const relatedPosts = await getRelatedPosts(post.id);
    const filteredRelated = relatedPosts.slice(0, 3);

    // --- JSON-LD Schemas ---
    const canonicalUrl = absoluteUrl(`/blog/${slug}`);
    const authorName = post.author?.name || siteConfig.author.name;
    const authorUrl = post.author?.slug
        ? absoluteUrl(`/blog/author/${post.author.slug}`)
        : absoluteUrl("/blog");
    const categories = post.categories?.map((c: any) => c.category?.name).filter(Boolean) || [];

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt || "",
        url: canonicalUrl,
        datePublished: new Date(post.createdAt).toISOString(),
        dateModified: new Date(post.updatedAt || post.createdAt).toISOString(),
        image: post.bannerImage?.url
            ? {
                  "@type": "ImageObject",
                  url: post.bannerImage.url,
                  width: 1200,
                  height: 630,
              }
            : undefined,
        author: {
            "@type": "Person",
            name: authorName,
            url: authorUrl,
            image: post.author?.image || undefined,
        },
        publisher: {
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
            logo: {
                "@type": "ImageObject",
                url: absoluteUrl("/logo.png"),
            },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl,
        },
        keywords: categories.join(", "),
        articleSection: categories[0] || "Blog",
        inLanguage: "en",
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
            ...(categories[0]
                ? [
                      {
                          "@type": "ListItem",
                          position: 3,
                          name: categories[0],
                          item: `${siteConfig.url}/blog/category/${post.categories[0]?.category?.slug || ""}`,
                      },
                      {
                          "@type": "ListItem",
                          position: 4,
                          name: post.title,
                          item: canonicalUrl,
                      },
                  ]
                : [
                      {
                          "@type": "ListItem",
                          position: 3,
                          name: post.title,
                          item: canonicalUrl,
                      },
                  ]),
        ],
    };



    return (
        <div>
            <ViewCounter slug={slug} />
            <SchemaOrg schema={[articleSchema, breadcrumbSchema]} />
            <PostLayout post={post}>
                <PostContent htmlContent={post.htmlContent} />
            </PostLayout>

            <div className="max-w-6xl mx-auto px-4 lg:px-0 pb-24">
                <RelatedPosts posts={filteredRelated} />
            </div>
        </div>
    );
}
