import { Post } from "@/types/post"
import { MonetizationSlot } from "../monetization/monetization-slot"
import { Clock, Tag, User, Calendar } from "lucide-react"
import { SidebarWidgets } from "./sidebar-widgets"
import { calculateReadTime } from "@/lib/read-time";
import { CldImage } from 'next-cloudinary'
import Image from "next/image";

interface PostLayoutProps {
    children: React.ReactNode;
    post: Post;
}

export const PostLayout = ({ children, post }: PostLayoutProps) => {
    const bannerUrl = post.bannerImage?.url;

    const author = post.author;
    const date = new Date(post.createdAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const readTime = calculateReadTime(post.content);

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-10 pb-12 px-4 lg:px-0 mt-8">
            {/* Title Section */}
            <header className="mb-2">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
                    {post.title}
                </h1>
            </header>

            {/* Banner Section with Overlay */}
            {bannerUrl && (
                <div className="w-full aspect-21/10 md:aspect-21/9 relative rounded-xl overflow-hidden shadow-2xl group border border-gray-100/50">
                    <CldImage
                        fill
                        priority
                        sizes="(max-width: 1152px) 100vw, 1152px"
                        src={bannerUrl} 
                        alt={post.title} 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 items-end gap-6 md:gap-8 text-white/90">
                            
                            {/* 1: Written By */}
                            <div className="flex flex-col gap-2.5">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 flex items-center gap-1.5">
                                    <User className="size-2.5" /> Written by
                                </span>
                                <div className="flex items-center gap-3">
                                    {author?.image ? (
                                        <Image src={author.image} alt={author.name} className="size-10 rounded-full border border-white/20 object-cover" />
                                    ) : (
                                        <div className="size-10 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold border border-white/20">
                                            {author?.name?.[0] || 'U'}
                                        </div>
                                    )}
                                    <span className="font-semibold text-base md:text-lg line-clamp-1">{author?.name || "System"}</span>
                                </div>
                            </div>

                            {/* 2: Published On */}
                            <div className="flex flex-col gap-2.5">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 flex items-center gap-1.5">
                                    <Calendar className="size-2.5" /> Published on
                                </span>
                                <span className="font-semibold text-base md:text-lg line-clamp-1">{date}</span>
                            </div>

                            {/* 3: Read Time */}
                            <div className="flex flex-col gap-2.5">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 flex items-center gap-1.5">
                                    <Clock className="size-2.5" /> Duration
                                </span>
                                <span className="font-semibold text-base md:text-lg">{readTime} min read</span>
                            </div>

                            {/* 4: Category */}
                            <div className="flex flex-col gap-2.5 md:items-end col-span-2 md:col-span-1 border-t border-white/10 pt-4 md:pt-0 md:border-none w-full">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 flex items-center gap-1.5 md:justify-end">
                                    <Tag className="size-2.5" /> Category
                                </span>
                                <div className="flex flex-wrap md:justify-end gap-2">
                                    {post.categories?.map((cat: any, idx) => (
                                        <span key={idx} className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-sm text-[10px] md:text-xs font-bold border border-white/10 ring-1 ring-white/5 whitespace-nowrap">
                                            {cat.category?.name || cat.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            
            <div className="grid grid-cols-12 gap-10">
                <article className="col-span-12 md:col-span-8 lg:col-span-8 text-lg leading-relaxed text-gray-800">
                    {children}
                </article>

                <aside className="col-span-12 md:col-span-4 lg:col-span-4 flex flex-col gap-10">
                    <div className="sticky top-8 flex flex-col gap-10">
                        <MonetizationSlot
                            slot={'sidebar-top'}
                            className="h-[350px] w-full rounded-sm overflow-hidden border border-gray-100 shadow-sm"
                        />
                        <SidebarWidgets />
                    </div>
                </aside>
            </div>
        </div>
    )
}