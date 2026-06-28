import { Metadata } from "next"
import NewPostClient from "./client"

export const metadata: Metadata = {
    title: "Create Post | Dashboard",
    description: "Create Post | Dashboard",
    robots: {
        index: false,
        follow: false,
    }
}

export default function CreatePostPage() {
    return <NewPostClient />
}
