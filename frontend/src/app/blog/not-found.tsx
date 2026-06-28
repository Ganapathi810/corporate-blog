import Link from "next/link";

export default function NotFoundPage() {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-blue-400">404</h1>
                <p className="text-xl text-blue-300">Post not found</p>
                <Link href="/blog" className="text-blue-500 hover:underline mt-4 block">Back to blog</Link>
            </div>
        </div>
    )
}