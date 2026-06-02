import { ShieldAlert, LayoutDashboard, PenLine } from "lucide-react"

export type UserRole = "ADMIN" | "EDITOR" | "WRITER"

interface RoleBadgeProps {
    role?: UserRole | string
    className?: string
}

export const RoleBadge = ({ role = "WRITER", className = "" }: RoleBadgeProps) => {
    const r = role.toUpperCase() as UserRole

    const config = {
        ADMIN: {
            bg: "bg-purple-50 text-purple-700 border-purple-200",
            icon: <ShieldAlert className="size-3" />,
        },
        EDITOR: {
            bg: "bg-blue-50 text-blue-700 border-blue-200",
            icon: <LayoutDashboard className="size-3" />,
        },
        WRITER: {
            bg: "bg-teal-50 text-teal-700 border-teal-200",
            icon: <PenLine className="size-3" />,
        },
    }

    const { bg, icon } = config[r] || config.WRITER

    return (
        <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${bg} ${className}`}>
            {icon}
            {r}
        </span>
    )
}
