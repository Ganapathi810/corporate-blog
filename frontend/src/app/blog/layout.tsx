import { PublicTopbar } from "@/components/top-bar/public-top-bar";
import { BlogLayoutClient } from "./blog-layout-client";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return (
        <BlogLayoutClient publicTopbar={<PublicTopbar />}>
            {children}
        </BlogLayoutClient>
    )
}
