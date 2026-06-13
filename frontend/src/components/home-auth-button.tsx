"use client"

import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export const HomeAuthButton = () => {
    const { data: session, isPending } = authClient.useSession()

    if(isPending) {
        return (
            <div className="h-12 w-40 bg-[#414BEA] rounded-xl animate-pulse" />
        )
    }

    if(session) {   
        return (
            <Link
                href="/dashboard"
                className="px-8 py-4 bg-[#525CEB] text-white rounded-xl font-semibold hover:bg-[#3F49D1] transition shadow-md"
            >
                Go to Dashboard
            </Link>
        )
    }

    return (
        <Link
            href="/login"
            className="px-8 py-4 bg-[#525CEB] text-white rounded-xl font-semibold hover:bg-[#3F49D1] transition shadow-md"
        >
            Sign In to Write
        </Link>
    )
}