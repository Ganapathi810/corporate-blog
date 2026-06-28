import { Metadata } from "next"
import LogsClient from "./client"

export const metadata: Metadata = {
    title: "Monitor Audit Logs | Dashboard",
    description: "Monitor Audit Logs | Dashboard",
    robots: {
        index: false,
        follow: false,
    }
}

export default function AuditLogsPage() {
    return <LogsClient />
}
