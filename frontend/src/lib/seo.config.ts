/**
 * Central SEO configuration for the corporate blog.
 * Update these values to match your brand before deploying.
 */

export const siteConfig = {
    name: "Corporate Blog",
    tagline: "Insights and Stories from Corporate Blog",
    description:
        "Your hub for the latest fintech industry news, company updates, thought leadership, and expert perspectives from our team.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com",
    ogImage: "/og-default.png",
    twitterHandle: "@yourbrand",
    locale: "en_IN",
    author: {
        name: "Corporate Blog Team",
        url: "/blog",
    },
} as const;

/** Build an absolute URL from a relative path */
export function absoluteUrl(path: string): string {
    return `${siteConfig.url}${path}`;
}

/** Build a page title with optional site name suffix */
export function buildTitle(title: string, withSuffix = true): string {
    if (!withSuffix) return title;
    return `${title} | ${siteConfig.name}`;
}
