"use client"

import { authClient } from "@/lib/auth-client";
import { AvatarWithDropdown } from "../avatar-with-dropdown";
import Link from "next/link";

export const TopBarAuthButton = () => {
    const { data: session, isPending } = authClient.useSession();

    if(isPending) {
        return (
            <div className="h-10 w-10 rounded-full animate-pulse bg-[#414BEA]" />
        );
    }

    if(session) {
        return (
            <div className="flex items-center gap-4">
                <AvatarWithDropdown />
            </div>
        )
    }

    return (
        <Link
            href="/login"
            className="px-4 py-2 bg-white text-[#525CEB] font-semibold rounded-lg hover:bg-blue-50 transition-colors text-sm"
        >
            Sign Up / Log in
        </Link>
    )
}
    