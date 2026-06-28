"use client"

import { useSidebar } from "./sidebar-provider"
import { Menu } from "lucide-react"

export const MobileSidebarToggle = () => {
    const { open, setOpen } = useSidebar()

    if (open) return null;

    return (
        <button
            onClick={() => setOpen(true)}
            aria-label="open sidebar menu"
            className="cursor-pointer md:hidden p-2 mr-2 text-white hover:bg-white/10 rounded-md transition-colors"
        >
            <Menu className="size-6" />
        </button>
    )
}
