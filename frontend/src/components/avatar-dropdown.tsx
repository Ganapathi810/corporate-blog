"use client"

import { signOut, useSession } from "@/lib/auth-client"
import Image from "next/image"
import { Dispatch, SetStateAction } from "react"
import { Loader2, LogOut } from "lucide-react"
import { RoleBadge } from "./role-badge"


interface AvatarDropdownProps {
    setOpen: Dispatch<SetStateAction<boolean>>
}

export const AvatarDropdown = ({ setOpen }: AvatarDropdownProps) => {
    const { data: session, isPending } = useSession()

    if (isPending) {
        return (
            <div className="bg-white absolute right-2 top-12 border border-blue-100 w-72 p-8 shadow-lg rounded-md flex justify-center items-center">
                <Loader2 className="animate-spin text-blue-500" />
            </div>
        )
    }    if (!session?.user) return null

    const { name, email, role, image } = session.user

    return (
        <div className="bg-white absolute right-2 top-12 border border-blue-100 w-72 p-2 shadow-lg rounded-md transition-all duration-100 z-[110]">
            <div className="flex items-center gap-2 p-1">
                <div className="shrink-0 relative size-12 rounded-full overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                    {image ? (
                        <Image 
                            src={image} 
                            fill
                            alt={name} 
                            className="object-cover"
                        />
                    ) : (
                        <span className="text-slate-400 font-bold text-lg">
                            {name?.toUpperCase().charAt(0)}
                        </span>
                    )}
                </div>
                <div className="flex flex-col items-start gap-1 min-w-0 overflow-hidden">
                    <span className="text-slate-800 font-semibold truncate w-full leading-tight">{name}</span>
                    <span className="text-xs truncate w-full text-slate-500">{email}</span>
                </div>
            </div>
                <div className="mx-auto w-fit py-4">
                    <RoleBadge role={role} />
                </div>


            <div className="border-t border-slate-50 pt-1">
                <button
                    onClick={async () => {
                        await signOut()
                        setOpen(false)
                    }}
                    className="cursor-pointer flex items-center gap-2 text-red-500 hover:bg-red-50 text-sm font-medium w-full p-2.5 rounded-md transition-colors duration-100 text-left"
                >
                    <LogOut className="size-4" />
                    <span>Sign out</span>
                </button>
            </div>
        </div>
    )
}