import Link from "next/link"
import { BaseTopbar } from "./base-top-bar"
import { getServerSession } from "@/lib/auth-server"
import { AvatarWithDropdown } from "../avatar-with-dropdown"

export const PublicTopbar = async () => {
    const { data: session } = await getServerSession();

    return (
        <BaseTopbar showBlogLink={true}>
            {session ? (
                <div className="flex items-center gap-4">
                    <AvatarWithDropdown />
                </div>
            ) : (
                <Link
                    href="/login"
                    className="px-4 py-2 bg-white text-[#525CEB] font-semibold rounded-lg hover:bg-blue-50 transition-colors text-sm"
                >
                    Sign Up / Login
                </Link>
            )}
        </BaseTopbar>
    )
}