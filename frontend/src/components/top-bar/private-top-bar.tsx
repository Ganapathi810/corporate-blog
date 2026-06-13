import { BaseTopbar } from "./base-top-bar"
import { MobileSidebarToggle } from "@/components/dashboard/mobile-sidebar-toggle"
import { TopBarAuthButton } from "./topbar-auth-buttton"

export const ProtectedTopbar = () => {
    return (
        <BaseTopbar startNode={<MobileSidebarToggle />} hideLogo>
            <TopBarAuthButton />
        </BaseTopbar>
    )
}