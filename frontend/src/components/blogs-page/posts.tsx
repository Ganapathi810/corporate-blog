import { Post } from "@/types/post"
import { BlogPost } from "./BlogPost"
import { EmptyState } from "./empty-state"

interface PostsListProps {
    posts: Post[]
    hasFilters?: boolean
}

export const PostsList = ({ posts, hasFilters = false }: PostsListProps) => {
    if (posts.length === 0) {
        return <EmptyState hasFilters={hasFilters} />
    }

    return (    
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post, index) => {
                
                const aboveFold = index < 3;

                return (
                    <BlogPost key={post.id} post={post} aboveFold={aboveFold} />
                )

            })}
            
        </div>
    )
}