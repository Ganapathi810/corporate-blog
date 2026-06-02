import { AvatarWithDropdown } from "../avatar-with-dropdown"
import { BaseTopbar } from "./base-top-bar"
import { MobileSidebarToggle } from "@/components/dashboard/mobile-sidebar-toggle"

export const ProtectedTopbar = () => {
    return (
        <BaseTopbar startNode={<MobileSidebarToggle />} hideLogo>
            <AvatarWithDropdown />
        </BaseTopbar>
    )
}