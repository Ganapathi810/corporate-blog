"use client"

import * as Sentry from "@sentry/nextjs";

import React, { useEffect, useRef, useState, useCallback } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Search, X, Loader2, FileText, ChevronRight } from "lucide-react"
import Link from "next/link"

/**
 * SearchBar — Production-ready with stable routing.
 * 
 * - Deterministic initialization from URL.
 * - Debounced URL updates without infinite loops.
 * - Guarded state synchronization (unidirectional flow).
 */
export const SearchBar = () => {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    
    // 1. Initialize from URL directly
    const [inputValue, setInputValue] = useState(searchParams.get('search') || "")
    const inputRef = useRef<HTMLInputElement>(null)
    const shouldFocus = searchParams.get('focus') === 'true'

    // 2. Sync input state when URL changes externally (e.g. from "Clear all filters")
    useEffect(() => {
        const urlSearch = searchParams.get('search') || ""
        if (urlSearch !== inputValue) {
            setInputValue(urlSearch)
        }
    }, [searchParams])

    useEffect(() => {
        if (shouldFocus && inputRef.current) {
            inputRef.current.focus()
        }
    }, [shouldFocus])

    // 3. Debounced URL update - only triggers when local state changes
    useEffect(() => {
        // Only trigger update if the value has actually changed from what's in the URL
        if (inputValue === (searchParams.get('search') || "")) return

        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (inputValue) {
                params.set('search', inputValue)
            } else {
                params.delete('search')
            }
            replace(`${pathname}?${params.toString()}`, { scroll: false })
        }, 300)

        return () => clearTimeout(timer)
    }, [inputValue, pathname, replace]) // searchParams intentionally omitted to break infinite loop

    // --- PREVIEW LOGIC ---
    const [previews, setPreviews] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const containerRef = useRef<HTMLDivElement>(null)

    // Fetch previews
    useEffect(() => {
        const query = inputValue.trim()
        if (query.length < 2) {
            setPreviews([])
            setShowDropdown(false)
            return
        }

        const fetchTimer = setTimeout(async () => {
            setIsLoading(true)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts?search=${encodeURIComponent(query)}&limit=5&status=PUBLISHED`)
                if (res.ok) {
                    const data = await res.json()
                    setPreviews(data.data || [])
                    setShowDropdown(true)
                    setSelectedIndex(-1)
                }
            } catch (error) {
                Sentry.captureException(error)
            } finally {
                setIsLoading(false)
            }
        }, 300)

        return () => clearTimeout(fetchTimer)
    }, [inputValue])

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown || previews.length === 0) return

        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex(prev => (prev < previews.length - 1 ? prev + 1 : prev))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            e.preventDefault()
            const selected = previews[selectedIndex]
            replace(`/blog/${selected.slug}`)
            setShowDropdown(false)
            setInputValue("")
        } else if (e.key === "Escape") {
            setShowDropdown(false)
        }
    }

    const handleClear = () => {
        setInputValue("")
        setPreviews([])
        setShowDropdown(false)
        inputRef.current?.focus()
    }

    const HighlightedText = ({ text, query }: { text: string; query: string }) => {
        if (!query.trim()) return <>{text}</>
        
        // Escape special regex characters
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))
        return (
            <span>
                {parts.map((part, i) => 
                    part.toLowerCase() === query.toLowerCase() 
                        ? <span key={i} className="text-[#414BEA] font-bold underline decoration-2 underline-offset-2">{part}</span> 
                        : part
                )}
            </span>
        )
    }
    
    return (
        <div ref={containerRef} className="mt-4 rounded-sm relative group w-full mb-8 z-50">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#525CEB] transition-colors" />
                <input 
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => inputValue.length >= 2 && setShowDropdown(true)}
                    placeholder="Search blogs by title or content..."
                    className="w-full pl-10 pr-10 py-3 border border-blue-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-[#525CEB] transition-all bg-white hover:bg-slate-50/50 shadow-sm"
                />
                
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isLoading && <Loader2 className="size-4 text-[#414BEA] animate-spin" />}
                    {inputValue && (
                        <button 
                            onClick={handleClear}
                            className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Preview Dropdown */}
            {showDropdown && (previews.length > 0 || isLoading) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Instant Previews</span>
                        {previews.length > 0 && (
                            <span className="text-[10px] font-medium text-slate-400 mr-2">{previews.length} matches found</span>
                        )}
                    </div>
                    
                    <div className="max-h-[350px] overflow-y-auto p-1">
                        {previews.length > 0 ? (
                            previews.map((post, index) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    onClick={() => {
                                        setShowDropdown(false)
                                        setInputValue("")
                                    }}
                                    className={`flex items-start gap-3 p-3 rounded-md transition-all duration-200 ${
                                        selectedIndex === index ? "bg-[#414BEA]/5 border-[#414BEA]/10" : "hover:bg-slate-50 border-transparent"
                                    } border`}
                                >
                                    <div className={`p-2 rounded-sm shrink-0 ${selectedIndex === index ? "bg-[#414BEA] text-white" : "bg-slate-100 text-slate-500"}`}>
                                        <FileText className="size-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 truncate">
                                            <HighlightedText text={post.title} query={inputValue} />
                                        </h4>
                                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                            {post.excerpt || "Click to read more..."}
                                        </p>
                                    </div>
                                    <ChevronRight className={`size-4 self-center transition-transform ${selectedIndex === index ? "translate-x-1 text-[#414BEA]" : "text-slate-300"}`} />
                                </Link>
                            ))
                        ) : !isLoading && (
                            <div className="p-8 text-center">
                                <Search className="size-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-sm text-slate-400 font-medium">No instant matches found</p>
                            </div>
                        )}
                    </div>

                    {previews.length > 0 && (
                        <div className="p-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 px-4">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-xs text-slate-900">↑↓</kbd> Navigate</span>
                                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-xs text-slate-900">Enter</kbd> Select</span>
                            </div>
                            <span>Press ESC to close</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}