import { Metadata } from "next"
import UsersClient from "./client"

export const metadata: Metadata = {
    title: "Manage Users | Dashboard",
    description: "Manage users | Dashboard",
    robots: {
        index: false,
        follow: false,
    }
}

export default function UsersPage() {
    return <UsersClient />
}
