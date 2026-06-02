"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { RoleBadge } from "@/components/role-badge"
import { toast } from "sonner"
import {
    Trash2, PenLine, ShieldAlert,
    LayoutDashboard
} from "lucide-react"
import { TableSkeleton } from "@/components/dashboard/skeletons"
import { Tooltip } from "@/components/ui/tooltip"
import { ConfirmModal } from "@/components/dashboard/shared"

type UserRole = "ADMIN" | "EDITOR" | "WRITER"

interface User {
    id: string
    name: string
    email: string
    role: UserRole
    createdAt: string
}

export default function UsersPage() {
    const { data: session, isPending } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [confirmAction, setConfirmAction] = useState<{
        title: string; desc: string; onConfirm: () => void;
        variant?: "primary" | "danger"; label?: string;
    } | null>(null)

    useEffect(() => {
        if (!isPending && session?.user?.role?.toUpperCase() !== "ADMIN") {
            router.push("/dashboard")
        }
    }, [session, isPending, router])

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`, { credentials: "include" })
            const data = await res.json()
            setUsers(data.data ?? [])
        } catch {
            toast.error("Failed to load users")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { 
        if (!isPending && session) {
            fetchUsers() 
        }
    }, [isPending, session])

    const updateRole = async (userId: string, role: UserRole) => {
        setIsActionLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ role }),
            })
            if (!res.ok) throw new Error()
            toast.success(`Role updated to ${role}`)
            fetchUsers()
        } catch {
            toast.error("Failed to update role")
        } finally {
            setIsActionLoading(false)
            setConfirmAction(null)
        }
    }

    const deleteUser = async (userId: string) => {
        setIsActionLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${userId}`, { method: "DELETE", credentials: "include" })
            if (!res.ok) throw new Error()
            toast.success("User deleted successfully")
            fetchUsers()
        } catch {
            toast.error("Failed to delete user")
        } finally {
            setIsActionLoading(false)
            setConfirmAction(null)
        }
    }

    if (isPending || !session) return <TableSkeleton rows={8} mode="ADMIN_USERS" />

    return (
        <div className="max-w-6xl mx-auto pt-6 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 pt-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-500 text-sm mt-0.5">Control platform access and assign administrative roles.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <TableSkeleton rows={8} mode="ADMIN_USERS" />
                ) : (
                    <table className="w-full text-sm text-gray-700">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-gray-900">{user.name}</div>
                                        <div className="text-xs text-gray-400">{user.email}</div>
                                    </td>
                                    <td className="px-4 py-4 text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-4">
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Tooltip content="Promote to Admin" position="top">
                                                <button
                                                    disabled={user.role === "ADMIN"}
                                                    onClick={() => setConfirmAction({
                                                        title: "Promote to Admin",
                                                        desc: `Grant full administrative privileges to ${user.name}?`,
                                                        onConfirm: () => updateRole(user.id, "ADMIN"),
                                                        label: "Make Admin"
                                                    })}
                                                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[13px] font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ShieldAlert className="size-4" />
                                                    Make Admin
                                                </button>
                                            </Tooltip>
                                            <Tooltip content="Make Editor" position="top">
                                                <button
                                                    disabled={user.role === "EDITOR"}
                                                    onClick={() => setConfirmAction({
                                                        title: "Make Editor",
                                                        desc: `Allow ${user.name} to curate and publish content?`,
                                                        onConfirm: () => updateRole(user.id, "EDITOR"),
                                                        label: "Make Editor"
                                                    })}
                                                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[13px] font-bold bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <LayoutDashboard className="size-4" />
                                                    Make Editor
                                                </button>
                                            </Tooltip>
                                            <Tooltip content="Make Writer" position="top">
                                                <button
                                                    disabled={user.role === "WRITER"}
                                                    onClick={() => setConfirmAction({
                                                        title: "Make Writer",
                                                        desc: `Switch ${user.name} to a standard writer role?`,
                                                        onConfirm: () => updateRole(user.id, "WRITER"),
                                                        label: "Make Writer"
                                                    })}
                                                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[13px] font-bold bg-green-50 text-green-600 border border-green-100 hover:bg-green-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <PenLine className="size-4" />
                                                    Make Writer
                                                </button>
                                            </Tooltip>
                                            <div className="w-px h-4 bg-gray-100 mx-1" />
                                            <Tooltip content="Delete User" position="top">
                                                <button
                                                    onClick={() => setConfirmAction({
                                                        title: "Delete User",
                                                        desc: `Permanently remove ${user.name} and all their data? This cannot be undone.`,
                                                        onConfirm: () => deleteUser(user.id),
                                                        variant: "danger",
                                                        label: "Delete User"
                                                    })}
                                                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[13px] font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all"
                                                >
                                                    <Trash2 className="size-4" />
                                                    Delete
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <ConfirmModal 
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                isLoading={isActionLoading}
                title={confirmAction?.title || ""}
                description={confirmAction?.desc || ""}
                confirmLabel={confirmAction?.label}
                confirmVariant={confirmAction?.variant}
                onConfirm={() => confirmAction?.onConfirm()}
            />
        </div>
    )
}
