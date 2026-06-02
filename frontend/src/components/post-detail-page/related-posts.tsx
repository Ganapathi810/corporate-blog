import { Post } from "@/types/post"
import { PostsList } from "../blogs-page/posts"

interface RelatedPostsProps {
    posts: Post[]
}

export const RelatedPosts = ({ posts }: RelatedPostsProps) => {
    return (
        <div>
            <h2 className="text-2xl font-semibold px-4 md:px-0 max-w-6xl mx-auto mt-8">Related Blogs</h2>
            <div className="max-w-6xl mx-auto px-4 md:px-0">
                <PostsList posts={posts} />
            </div>
        </div>
    )
}