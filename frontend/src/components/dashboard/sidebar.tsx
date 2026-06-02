"use client"

import Image from "next/image"
import { SidebarLinks } from "./sidebar-links"
import { Role } from "@/types/role"
import clsx from "clsx"
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useSidebar } from "./sidebar-provider"
import { useSession } from "@/lib/auth-client"

export const Sidebar = () => {
    const { open, setOpen } = useSidebar()
    const { data: session } = useSession()

    const role = (session?.user?.role?.toUpperCase() || "WRITER") as Role

    return (
        <>
            {open && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <aside className={clsx(
                "fixed inset-y-0 left-0 z-50 md:sticky top-0 h-screen",
                "border-r border-[#3640cc] bg-[#414BEA] transition-all duration-300 ease-in-out shrink-0",
                open ? "w-64 translate-x-0" : "w-16 -translate-x-full md:translate-x-0"
            )}>
                <div className={clsx(
                    "flex items-center gap-2 p-4 h-16 group",
                    !open && "justify-center px-0 mx-auto"
                )}>
                    {open ? (
                        <>
                            <Image
                                src="/favicon.ico"
                                alt="Logo"
                                width={34}
                                height={34}
                                className="shrink-0"
                            />
                            <button 
                                onClick={() => setOpen(false)}
                                className="cursor-pointer text-blue-300 hover:bg-white/10 transition-colors duration-150 rounded-md p-1.5 ml-auto"
                            >
                                <PanelRightOpen className="size-6"/>
                            </button>
                        </>
                    ) : (
                        <div className="relative hidden md:flex items-center justify-center w-8 h-8">
                            <Image
                                src="/favicon.ico"
                                alt="Logo"
                                width={34}
                                height={34}
                                className="shrink-0 group-hover:opacity-0 transition-opacity duration-150"
                            />
                            <button 
                                onClick={() => setOpen(true)}
                                className="cursor-pointer absolute inset-0 flex items-center justify-center text-blue-300 hover:bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-150"
                            >
                                <PanelRightClose className="size-6"/>
                            </button>
                        </div>
                    )}
                </div>

                <div className="px-2">
                    <SidebarLinks role={role} />
                </div>
            </aside>
        </>
    )
}