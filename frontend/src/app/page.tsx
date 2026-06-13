import Link from "next/link";
import { PublicTopbar } from "@/components/top-bar/public-top-bar";
import { SchemaOrg } from "@/components/schema-org";
import type { Metadata } from "next";
import { siteConfig, absoluteUrl } from "@/lib/seo.config";
import { HomeAuthButton } from "@/components/home-auth-button";

export const metadata: Metadata = {
    title: siteConfig.name,
    description: siteConfig.description,
    alternates: {
        canonical: siteConfig.url,
    },
    openGraph: {
        type: "website",
        url: siteConfig.url,
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
        images: [
            {
                url: absoluteUrl(siteConfig.ogImage),
                width: 1200,
                height: 630,
                alt: siteConfig.name,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.name,
        description: siteConfig.description,
        images: [absoluteUrl(siteConfig.ogImage)],
    },
};

export default async function Home() {

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/logo.png"),
        },
        sameAs: [],
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteConfig.url}/blog?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };


    return (
        <div className="flex flex-col min-h-screen">
            <SchemaOrg schema={[organizationSchema, websiteSchema]} />
            <PublicTopbar />
            <main className="flex-grow flex flex-col items-center justify-center bg-blue-100 p-6">
                <div className="max-w-2xl text-center">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                        Insights and Stories from{" "}
                        <span className="text-[#525CEB]">Corporate Blog</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-10">
                        Your hub for the latest industry news, company updates, and expert
                        perspectives.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/blog"
                            className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition shadow-sm"
                        >
                            Browse Blog
                        </Link>

                        <HomeAuthButton />
                    </div>
                </div>
            </main>
        </div>
    );
}
