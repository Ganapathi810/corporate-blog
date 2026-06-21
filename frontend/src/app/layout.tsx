import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { siteConfig, absoluteUrl } from "@/lib/seo.config";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

const poppins = Poppins({
    weight: ["400", "500", "600", "700", "800", "900"],
    subsets: ["latin"],
    display: "swap",
    preload: true,
});

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [
        "corporate blog",
        "fintech",
        "industry insights",
        "thought leadership",
        "company news",
        "finance",
        "technology",
    ],
    authors: [{ name: siteConfig.author.name, url: absoluteUrl("/blog") }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        type: "website",
        locale: siteConfig.locale,
        url: siteConfig.url,
        siteName: siteConfig.name,
        title: siteConfig.name,
        description: siteConfig.description,
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
        site: siteConfig.twitterHandle,
        creator: siteConfig.twitterHandle,
        title: siteConfig.name,
        description: siteConfig.description,
        images: [absoluteUrl(siteConfig.ogImage)],
    },
    alternates: {
        canonical: siteConfig.url,
    },
    category: "technology",
};

export const viewport = {
    themeColor: "#032069",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en-IN">
            <head>
                <link rel="preconnect" href="https://res.cloudinary.com" />
                <link rel="dns-prefetch" href="https://res.cloudinary.com" />
            </head>
            <body className={`${poppins.className}`}>
                <NextTopLoader color="#032069" showSpinner={false} zIndex={99999} />
                {children}
                <Toaster position="top-right" richColors closeButton />
            </body>
        </html>
    );
}
