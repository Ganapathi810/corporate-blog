import { Post } from "@/types/post"
import Link from "next/link";
import { calculateReadTime, extractContent } from "@/lib/read-time";

interface BlogPostProps {
    post: Post
}

export const BlogPost = ({ post }: BlogPostProps) => {
    const category = post.categories?.[0]?.category?.name || "Technology";
    const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }) : "30 Jan 2024";

    const readTime = calculateReadTime(post.content);
    
    // Extract textual content for fallback excerpt
    const plainText = extractContent(post.content);
    const displayExcerpt = post.excerpt || plainText || "Read the full story on our engineering blog.";

    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <div className="group cursor-pointer">
                <div className="relative overflow-hidden rounded">
                    <img 
                        src={post.bannerImage?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ19T7uZ703V67_cJEb2W13ISrPzEo2-auBdw&s"} 
                        alt={post.title} 
                        className="w-full h-48 object-cover rounded group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    />
                    <div className="absolute top-3 left-3 bg-blue-300/20 px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center backdrop-blur-sm border border-white/10">{category}</div>
                </div>
                <div className="mt-2 flex gap-3 items-center text-sm text-blue-900">
                    <span>{date}</span>
                    <span className="rounded-full size-1 bg-blue-300"></span>
                    <span>{readTime + " min read"}</span>
                </div>
                <h2 className="mt-2 text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">{post.title}</h2>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{displayExcerpt}</p>
                <div className="mt-4 flex items-center gap-2">
                    <img
                        src={post.author?.image || '/favicon.ico'}
                        alt={post.author?.name}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <p className="text-sm font-semibold">{post.author?.name || "Author"}</p>
                </div>
            </div>
        </Link>
    )
}