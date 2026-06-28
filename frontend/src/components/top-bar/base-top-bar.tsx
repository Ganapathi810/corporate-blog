import { Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Tooltip } from "../ui/tooltip"

export const BaseTopbar = ({ children, startNode, hideLogo, showBlogLink }: { children: React.ReactNode, startNode?: React.ReactNode, hideLogo?: boolean, showBlogLink?: boolean }) => {

    return (
        <header className="sticky top-0 h-16 shadow-md flex justify-between items-center px-4 md:px-6 py-2 bg-[#414ceafd] border-b border-[#3640cc] z-[100]">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    {startNode}
                    <Link 
                        aria-label="Corporate Blog home" 
                        href={'/'} 
                        className="flex items-center gap-2"
                    >
                        {!hideLogo && <Image src={'/favicon.ico'} height={28} width={28} alt="logo" />}
                        <span className="text-xl font-bold text-white hidden sm:block">Corporate Blog</span>
                    </Link>
                </div>
                
                {showBlogLink && (
                    <nav className="hidden md:flex items-center gap-8 border-l border-slate-200 pl-8 h-6 self-center lowercase">
                        <Link 
                            href="/blog" 
                            className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                        >
                            Blog
                        </Link>
                    </nav>
                )}
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <Tooltip content="Search posts" position="bottom">
                    <Link
                        aria-label="Search blogs"

                        href="/blog?focus=true" 
                        className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                    >
                        <Search className="size-5 text-white/90 group-hover:text-white" />
                    </Link>
                </Tooltip>
                <div className="flex items-center gap-2">
                    {children}
                </div>
            </div>
        </header>
    )
}