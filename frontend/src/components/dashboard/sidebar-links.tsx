"use client"

import { sidebarLinks } from "@/lib/sidebar-links"
import { Role } from "@/types/role"
import Link from "next/link"
import clsx from "clsx"
import { usePathname } from "next/navigation"
import { useSidebar } from "./sidebar-provider"
import { Tooltip } from "@/components/ui/tooltip"

interface Props {
    role: Role
}

export const SidebarLinks = ({ role }: Props) => {
    const pathname = usePathname()
    const { open } = useSidebar()
    const links = sidebarLinks.filter((link) => link.roles.includes(role))

    return (
        <nav className="mt-4 space-y-2">
            {links.map((link) => {
                const Icon = link.icon;
                const content = (
                    <Link
                        href={link.href}
                        aria-lable={open ? link.label : undefined}
                        className={clsx(
                            "flex items-center px-2 py-2 text-sm rounded-md text-white hover:bg-white/10 transition-colors duration-150 w-full",
                            open ? "gap-2" : "justify-center",
                            (link.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(link.href)) ? "bg-blue-800 font-semibold" : "hover:bg-white/15"
                        )}
                    >
                        <Icon className="size-5 shrink-0" />
                        <span
                            className={clsx(
                                open ? "whitespace-nowrap overflow-hidden" : "sr-only"
                            )}
                        >
                            {link.label}
                        </span>
                    </Link>
                );

                if (!open) {
                    return (
                        <Tooltip key={link.href} content={link.label} position="right" className="w-full">
                            {content}
                        </Tooltip>
                    );
                }

                return <div key={link.href}>{content}</div>;
            })}
        </nav>
    )
}