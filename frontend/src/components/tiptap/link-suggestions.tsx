"use client";

import * as Sentry from "@sentry/nextjs";

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Editor } from "@tiptap/react"
import { Loader2, Link as LinkIcon, ExternalLink, CheckCircle2, Search, Zap, Check } from "lucide-react"
import { toast } from "sonner"

interface Suggestion {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    score: number;
    category_score: number;
    text_score: number;
}

interface LinkSuggestionsProps {
    editor: Editor;
    postId: string | null;
}

export const LinkSuggestions = ({ editor, postId }: LinkSuggestionsProps) => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [matches, setMatches] = useState<Record<string, string | null>>({})
    const [alreadyLinked, setAlreadyLinked] = useState<Record<string, boolean>>({})
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    const fetchSuggestions = useCallback(async () => {
        if (!postId) return
        
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${postId}/internal-suggestions`, {
                credentials: 'include'
            })
            if (!response.ok) throw new Error("Failed to fetch suggestions")
            const data = await response.json()
            setSuggestions(data.data || [])
        } catch (err: any) {
            Sentry.captureException(err)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }, [postId])

    useEffect(() => {
        fetchSuggestions()
    }, [fetchSuggestions])

    // Detect links already present in the editor
    useEffect(() => {
        if (!editor || suggestions.length === 0) return

        const checkLinks = () => {
            const newAlreadyLinked: Record<string, boolean> = {}
            const existingLinks = new Set<string>()

            editor.state.doc.descendants((node) => {
                const linkMark = node.marks.find(m => m.type.name === 'link')
                if (linkMark) {
                    existingLinks.add(linkMark.attrs.href)
                }
            })

            suggestions.forEach(s => {
                const href = `/blog/${s.slug}`
                if (existingLinks.has(href)) {
                    newAlreadyLinked[s.id] = true
                }
            })
            
            setAlreadyLinked(newAlreadyLinked)
        }

        checkLinks()
        editor.on('update', checkLinks)
        return () => {
            editor.off('update', checkLinks)
        }
    }, [editor, suggestions])

    // Auto-fetch suggestions when user stops typing (1.5s debounce)
    useEffect(() => {
        if (!editor || !postId) return

        const handleUpdate = () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
            debounceTimerRef.current = setTimeout(() => {
                fetchSuggestions()
            }, 1500)
        }

        editor.on('update', handleUpdate)
        return () => {
            editor.off('update', handleUpdate)
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
        }
    }, [editor, postId, fetchSuggestions])

    // Scan editor content for keyword matches (basic anchor text suggestion)
    useEffect(() => {
        if (!editor || suggestions.length === 0) return

        const checkMatches = () => {
            const text = editor.getText()
            const textLower = text.toLowerCase()
            const newMatches: Record<string, string | null> = {}
            
            suggestions.forEach(s => {
                const titleLower = s.title.toLowerCase()
                // Simple match: Title exists in text
                if (textLower.includes(titleLower)) {
                    // Try to find the original casing from the text
                    const index = textLower.indexOf(titleLower)
                    const originalText = text.substring(index, index + s.title.length)
                    newMatches[s.id] = originalText
                } else {
                    // Try matching without some common words or stop words could go here
                    newMatches[s.id] = null
                }
            })
            setMatches(newMatches)
        }

        checkMatches()
        
        editor.on('update', checkMatches)
        return () => {
            editor.off('update', checkMatches)
        }
    }, [editor, suggestions])

    const insertLink = (s: Suggestion) => {
        if (alreadyLinked[s.id]) {
            toast.info(`"${s.title}" is already linked in this post.`, {
                description: "You can still add it again if needed, but it's already present.",
            })
        }

        const { selection } = editor.state
        const href = `/blog/${s.slug}`

        if (selection.empty) {
            // No selection: Insert the title as a link at the cursor
            editor.chain().focus().insertContent(`<a href="${href}">${s.title}</a>`).run()
        } else {
            // Has selection: Wrap selection in a link
            editor.chain().focus().setLink({ href }).run()
        }
    }

    if (!postId) {
        return (
            <div className="p-6 text-center h-full flex flex-col items-center justify-center bg-gray-50/30">
                <div className="bg-blue-50/50 p-3 rounded-full mb-4">
                    <LinkIcon className="size-6 text-[#414BEA]" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Suggestions pending</h3>
                <p className="text-xs text-gray-500 max-w-[180px]">
                    Save your draft to generate internal linking suggestions.
                </p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-100 overflow-hidden font-sans">
            <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="size-6 bg-[#414BEA]/10 rounded-sm flex items-center justify-center">
                        <LinkIcon className="size-3.5 text-[#414BEA]" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-900 pt-0.5">Internal Suggestions</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {isLoading && suggestions.length === 0 && (
                    <div className="py-20 text-center space-y-3">
                        <Loader2 className="size-6 animate-spin mx-auto text-[#414BEA]" />
                        <p className="text-xs font-medium text-gray-500">Analyzing content compatibility...</p>
                    </div>
                )}

                {!isLoading && suggestions.length === 0 && !error && (
                    <div className="py-20 text-center px-4">
                        <div className="bg-gray-100 size-10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="size-5 text-gray-400" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">No suggestions yet</h4>
                        <p className="text-xs text-gray-500 mt-1">Write more content or add categories to help our engine find related posts.</p>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-50 rounded-sm border border-red-100 text-center">
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-tighter mb-1">Engine Error</p>
                        <p className="text-xs text-red-500">{error}</p>
                    </div>
                )}

                {suggestions.map((s) => (
                    <div 
                        key={s.id} 
                        className={`group p-3 rounded-lg border transition-all duration-200 ${matches[s.id] ? "bg-blue-50/20 border-[#414BEA]/20 ring-1 ring-[#414BEA]/5" : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md"}`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#414BEA] transition-colors">
                                    {s.title}
                                </h4>
                                {matches[s.id] && (
                                    <div className="mt-1.5 flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-sm border border-green-100/50 w-fit">
                                        <div className="flex items-center justify-center size-3.5 bg-green-500 rounded-full">
                                            <CheckCircle2 className="size-2 text-white" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-green-700 uppercase leading-none">Internal match found</span>
                                            <span className="text-[10px] text-green-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                                "{matches[s.id]}"
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    <div className="text-[10px] font-black text-[#414BEA] px-1.5 py-0.5 bg-[#414BEA]/5 rounded-full border border-[#414BEA]/10">
                                        {Math.round(s.score)}%
                                    </div>
                                    {alreadyLinked[s.id] && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100 animate-in fade-in zoom-in duration-300">
                                            <Check className="size-2.5" />
                                            <span className="text-[9px] font-bold uppercase tracking-tighter">Added</span>
                                        </div>
                                    )}
                                </div>
                        </div>
                        
                        <p className="text-[11px] text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                            {s.excerpt}
                        </p>

                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => insertLink(s)}
                                className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#414BEA] border border-[#414BEA] rounded-md text-[11px] font-bold text-white hover:bg-[#414BEA]/90 hover:border-[#414BEA]/90 transition-all shadow-sm active:scale-95"
                            >
                                <LinkIcon className="size-3" />
                                Insert Link
                            </button>
                            <a 
                                href={`/blog/${s.slug}`} 
                                target="_blank"
                                className="p-1.5 bg-gray-50 border border-gray-200 rounded-md text-gray-500 hover:text-[#414BEA] hover:bg-[#414BEA]/5 transition-all shadow-sm"
                                title="View post"
                            >
                                <ExternalLink className="size-3" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
