import { Role } from "@/types/role";
import { LayoutDashboard, Users, FileText, Tags, ClipboardCheck, History, BookOpen, LucideIcon } from "lucide-react";

export interface SidebarLink {
    label: string;
    href: string;
    roles: Role[];
    icon: LucideIcon;
}

export const sidebarLinks: SidebarLink[] = [
    { label: "Overview", href: "/dashboard", roles: ["ADMIN", "EDITOR", "WRITER"], icon: LayoutDashboard },
    { label: "User Management", href: "/dashboard/users", roles: ["ADMIN"], icon: Users },
    { label: "Categories", href: "/dashboard/categories", roles: ["ADMIN"], icon: Tags },
    { label: "Audit Logs", href: "/dashboard/logs", roles: ["ADMIN"], icon: History },
    { label: "Live Blog", href: "/blog", roles: ["ADMIN", "EDITOR", "WRITER"], icon: BookOpen },
]