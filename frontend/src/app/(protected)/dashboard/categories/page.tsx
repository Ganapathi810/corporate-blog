import { Metadata } from "next"
import CategoriesClient from "./client"

export const metadata: Metadata = {
    title: "Manage Categories | Dashboard",
    description: "Manage categories | Dashboard",
    robots: {
        index: false,
        follow: false,
    }
}

export default function CategoriesPage() {
    return <CategoriesClient />
}
