"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { RoleBadge } from "@/components/role-badge"
import { toast } from "sonner"
import {
    Trash2, RefreshCw, Plus, ShieldAlert, History,
    CheckCircle2, XCircle
} from "lucide-react"
import { TableSkeleton } from "@/components/dashboard/skeletons"
import { Metadata } from "next"



export default function AuditLogsPage() {
    const { data: session, isPending } = useSession()
    const router = useRouter()
    const [logs, setLogs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [pagination, setPagination] = useState<any>(null)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        if (!isPending && session?.user?.role?.toUpperCase() !== "ADMIN") {
            router.push("/dashboard")
        }
    }, [session, isPending, router])

    const fetchLogs = async (page = 1) => {
        setIsLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit-logs?page=${page}`, { credentials: "include" })
            const data = await res.json()
            setLogs(data.data.logs ?? [])
            setPagination(data.data.pagination)
        } catch {
            toast.error("Failed to load audit logs")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { 
        if (!isPending && session) {
            fetchLogs(currentPage) 
        }
    }, [currentPage, session, isPending])

    const getIcon = (action: string) => {
        const a = action.toUpperCase()
        if (a.includes("PUBLISHED")) return <CheckCircle2 className="size-4 text-green-500" />
        if (a.includes("DELETED")) return <Trash2 className="size-4 text-red-500" />
        if (a.includes("CREATED")) return <Plus className="size-4 text-blue-500" />
        if (a.includes("REJECTED")) return <XCircle className="size-4 text-red-400" />
        if (a.includes("ROLE") || a.includes("ADMIN")) return <ShieldAlert className="size-4 text-purple-500" />
        if (a.includes("EDIT") || a.includes("UPDATE")) return <RefreshCw className="size-4 text-amber-500" />
        return <ActivityIcon className="size-4 text-gray-500" />
    }

    if (isPending || !session) return (
        <div className="max-w-6xl mx-auto pt-6 pb-12 px-4 sm:px-6 lg:px-8">
            <TableSkeleton rows={10} mode="ADMIN_USERS" />
        </div>
    )

    return (
        <div className="max-w-6xl mx-auto pt-6 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 pt-6">
                <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                <p className="text-gray-500 text-sm mt-0.5">Track system-wide activity and administrative changes.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <TableSkeleton rows={10} mode="ADMIN_USERS" />
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
                        <History className="size-10 opacity-40" />
                        <p className="text-sm font-medium">No activity logs found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {logs.map(log => (
                            <div key={log.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-start gap-4 group">
                                <div className="mt-1 p-2 rounded-lg bg-white border border-gray-100 shadow-sm group-hover:border-blue-100 transition-colors">
                                    {getIcon(log.action)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-900">
                                                {log.user?.name || "System"} 
                                            </span>
                                            {log.user?.role && <RoleBadge role={log.user.role} />}
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-tighter bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                {log.action.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                            {new Date(log.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1.5 line-clamp-1 font-medium">
                                        {log.post?.title || log.metadata?.userName || log.entityId || "No additional details"}
                                    </p>
                                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                                        <div className="mt-2 text-[10px] font-mono text-gray-400 flex gap-2 overflow-x-auto scrollbar-none pb-1">
                                            {Object.entries(log.metadata).map(([key, val]: [string, any]) => (
                                                <span key={key} className="whitespace-nowrap bg-gray-200/50 px-1.5 py-0.5 rounded capitalize">
                                                    {key}: {String(val)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {pagination && pagination.pages > 1 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-center gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="cursor-pointer px-4 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-sm bg-white disabled:opacity-50 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                        >
                            Previous
                        </button>
                        <div className="flex items-center px-4 text-xs font-bold text-gray-500">
                            {currentPage} / {pagination.pages}
                        </div>
                        <button 
                            disabled={currentPage === pagination.pages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="cursor-pointer px-4 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-sm bg-white disabled:opacity-50 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function ActivityIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
    )
}
