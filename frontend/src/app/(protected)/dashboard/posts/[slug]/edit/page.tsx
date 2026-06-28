import { Metadata } from "next"
import EditPostClient from "./client"

export const metadata: Metadata = {
    title: "Edit Post | Dashboard",
    description: "Edit Post | Dashboard",
    robots: {
        index: false,
        follow: false,
    }
}

export default function EditPostPage() {
    return <EditPostClient />
}
