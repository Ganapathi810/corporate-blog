"use client"

import React, { useState, useEffect, useRef } from "react"
import { 
    FileText, Clock, CheckCircle2, XCircle, AlertTriangle, 
    PenLine, Trash2, ShieldAlert, RefreshCw, MoreHorizontal 
} from "lucide-react"

import { Tooltip } from "@/components/ui/tooltip"
import { TableSkeleton } from "./skeletons"

// --- Types ---
export type PostStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "REJECTED"
export type PendingAction = "EDIT_REQUEST" | null

export interface Post {
    id: string
    title: string
    slug: string
    status: PostStatus
    pendingAction: PendingAction
    editedByEditor: boolean
    editedByAdmin: boolean
    originalPostId?: string
    author?: { name: string; email: string }
    createdAt: string
    updatedAt: string
}

// --- Components ---

export const StatusBadge = ({ status, pendingAction, hasPendingEdit }: { status: PostStatus; pendingAction?: PendingAction; hasPendingEdit?: boolean }) => {
    const config: Record<PostStatus, { label: string; className: string; icon: React.ReactNode }> = {
        DRAFT:      { label: "Draft",       className: "bg-sky-50 text-sky-700 border-sky-200",          icon: <FileText className="size-3" /> },
        IN_REVIEW:  { label: "In Review",   className: "bg-amber-50 text-amber-700 border-amber-200",     icon: <Clock className="size-3" /> },
        PUBLISHED:  { label: "Published",   className: "bg-green-50 text-green-700 border-green-200",     icon: <CheckCircle2 className="size-3" /> },
        REJECTED:   { label: "Rejected",    className: "bg-red-50 text-red-600 border-red-200",            icon: <XCircle className="size-3" /> },
    }

    const { label, className, icon } = config[status]

    const pendingLabel = pendingAction === "EDIT_REQUEST" ? "Edit Requested" : null

    return (
        <div className="flex flex-col gap-1 items-start">
            <span className={`inline-flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
                {icon} {label}
            </span>
            {pendingLabel && (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                    <AlertTriangle className="size-2.5" /> {pendingLabel}
                </span>
            )}
            {hasPendingEdit && (
                <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                    <PenLine className="size-2.5" /> Active Draft
                </span>
            )}
        </div>
    )
}

export const ConfirmModal = ({ 
    isOpen, onClose, onConfirm, title, description, 
    confirmLabel = "Confirm", confirmVariant = "primary", isLoading = false 
}: { 
    isOpen: boolean, onClose: () => void, onConfirm: () => void, 
    title: string, description: string, confirmLabel?: string, 
    confirmVariant?: "primary" | "danger", isLoading?: boolean
}) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 border border-gray-200 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-full ${confirmVariant === "danger" ? "bg-red-100" : "bg-blue-100"}`}>
                        {confirmVariant === "danger" ? <Trash2 className="size-5 text-red-600" /> : <ShieldAlert className="size-5 text-[#414BEA]" />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 leading-tight">{title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end mt-4">
                    <button onClick={onClose} disabled={isLoading} className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-sm hover:bg-gray-200 transition-colors disabled:opacity-50">Cancel</button>
                    <button 
                        onClick={onConfirm} disabled={isLoading} 
                        className={`cursor-pointer px-4 py-2 text-sm font-medium text-white rounded-sm flex items-center gap-2 transition-colors ${confirmVariant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-[#414BEA] hover:bg-[#3640cc]"}`}
                    >
                        {isLoading && <RefreshCw className="size-3.5 animate-spin" />} {isLoading ? "Processing..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export function PostTableSection({ 
    isLoading, posts, activeTab, setActiveTab, getActions, showAuthor, customTabs 
}: { 
    isLoading: boolean, posts: Post[], activeTab: string, setActiveTab: (v: string) => void, getActions: (p: Post) => any[], showAuthor: boolean, customTabs?: {label: string, value: string}[] 
}) {
    const tabs = customTabs || [
        { label: "All Blogs", value: "" },
        { label: "Drafts", value: "DRAFT" },
        { label: "In Review", value: "IN_REVIEW" },
        { label: "Published Blogs", value: "PUBLISHED" },
        { label: "Rejected Blogs", value: "REJECTED" },
    ]

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
            <div className="flex items-center gap-1 px-4 pt-4 border-b border-gray-200 overflow-x-auto scrollbar-none">
                {tabs.map(tab => (
                    <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`cursor-pointer px-3 py-2 text-sm font-medium rounded-t-sm whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab.value ? "border-[#414BEA] text-[#414BEA]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <TableSkeleton rows={8} mode={showAuthor ? "EDITOR" : "WRITER"} />
            ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
                    <FileText className="size-10 opacity-40" />
                    <p className="text-sm font-medium">No blogs found</p>
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Blog Title</th>
                            {showAuthor && <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Author</th>}
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-px whitespace-nowrap">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-px">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {posts.map(post => {
                            const actions = getActions(post)
                            return (
                                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-5 py-3.5">
                                        <span className="font-medium text-gray-900 line-clamp-1 group-hover:text-[#414BEA] transition-colors">{post.title}</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-400 font-mono">{post.slug}</span>
                                            {post.editedByEditor && post.status === "PUBLISHED" && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-tight">
                                                    Polished by Editor
                                                </span>
                                            )}
                                            {post.editedByAdmin && post.status === "PUBLISHED" && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-tight">
                                                    Polished by Admin
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {showAuthor && (
                                        <td className="px-4 py-3.5">
                                            <div className="text-gray-700 font-medium">{post.author?.name || "Unknown"}</div>
                                            <div className="text-[11px] text-gray-400">{post.author?.email}</div>
                                        </td>
                                    )}
                                    <td className="px-4 py-3.5 w-px whitespace-nowrap">
                                        <StatusBadge status={post.status} pendingAction={post.pendingAction} hasPendingEdit={posts.some(p => p.originalPostId === post.id)} />
                                    </td>
                                    <td className="px-4 py-3.5 text-gray-400 text-xs hidden sm:table-cell">
                                        {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            {actions.map((action, i) => (
                                                <Tooltip key={i} content={action.label} position="top">
                                                    <button 
                                                        disabled={action.disabled}
                                                        onClick={action.onClick} 
                                                        className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[13px] font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${action.color || (action.danger ? "text-red-500 hover:bg-red-50" : "text-gray-500 hover:bg-gray-100")}`}
                                                    >
                                                        {action.icon}
                                                        {action.label}
                                                    </button>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
    )
}
