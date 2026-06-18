interface PostContentProps {
    htmlContent?: string
}


export const PostContent = ({ htmlContent }: PostContentProps) => {
    // If pre-rendered HTML is available, render it directly without TipTap
    if (htmlContent) {
        return (
            <div 
                className="prose prose-blue lg:prose-xl max-w-none prose-img:rounded-xl prose-headings:tracking-tight prose-a:text-blue-600"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        )
    }

    // Fallback: show nothing if no content at all
    return (
        <div className="prose prose-blue lg:prose-xl max-w-none prose-img:rounded-xl prose-headings:tracking-tight prose-a:text-blue-600">
            <p className="text-gray-400 italic">No content available.</p>
        </div>
    )
}