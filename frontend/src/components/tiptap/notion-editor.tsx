"use client";

import * as Sentry from "@sentry/nextjs";

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import { DragHandle as DragHandleExtension } from '@tiptap/extension-drag-handle'
import { toast } from 'sonner'
import StarterKit from '@tiptap/starter-kit'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import ImageExtension from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import LinkExtension from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import TextAlign from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { TextSelection } from 'prosemirror-state'
import { Image as ImageIcon, Loader2, X, AlertCircle, Plus, Check, Link as LinkIcon } from 'lucide-react'
import { BlockHandle } from './block-handle'
import { BlockMenu } from './block-menu'
import { EditorBubbleMenu } from './bubble-menu'
import { SlashCommands, suggestionConfig } from './slash-command'
import { ImageUpload } from './image-upload'
import { CellPropertyMenu } from './cell-property-menu'
import { TableCellHandle } from './table-cell-handle'
import { LinkSuggestions } from './link-suggestions'
import { Search } from 'lucide-react'

export interface NotionEditorProps {
    title: string;
    onTitleChange: (title: string) => void;
    bannerUrl: string | null;
    onBannerChange: (url: string | null, imageId?: string | null) => void;
    onUpdateContent: (content: any) => void;
    showErrors?: boolean;
    slug?: string | null;
    onSlugChange?: (slug: string) => void;
    initialContent?: any;
    categoryIds: string[];
    onCategoryIdsChange: (ids: string[]) => void;
    excerpt?: string;
    onExcerptChange?: (text: string) => void;
    postId?: string | null;
}

export const NotionEditor = ({ title, onTitleChange, bannerUrl, onBannerChange, onUpdateContent, showErrors, slug, onSlugChange, initialContent, categoryIds, onCategoryIdsChange, excerpt = "", onExcerptChange, postId }: NotionEditorProps) => {
    const [menuVisible, setMenuVisible] = useState(false)
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
    const [isBannerUploading, setIsBannerUploading] = useState(false)
    const [dragHandleElement, setDragHandleElement] = useState<HTMLElement | null>(null)
    const editorRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLTextAreaElement>(null)
    const excerptRef = useRef<HTMLTextAreaElement>(null)
    const allUploadedIds = useRef<Set<string>>(new Set())
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)

    const [availableCategories, setAvailableCategories] = useState<{id: string, name: string}[]>([])
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/categories`)
            .then(res => res.json())
            .then(data => setAvailableCategories(data.data || []))
            .catch(err => Sentry.captureException(err))
    }, [])

    const toggleCategory = (id: string) => {
        if (categoryIds.includes(id)) {
            onCategoryIdsChange(categoryIds.filter(c => c !== id))
        } else {
            if (categoryIds.length >= 3) {
                toast.error("You can only select up to 3 categories")
                return
            }
            onCategoryIdsChange([...categoryIds, id])
        }
    }

    const resizeTitle = (target: HTMLTextAreaElement) => {
        target.style.height = 'auto'
        target.style.height = `${target.scrollHeight}px`
    }

    const handleTitleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        onTitleChange((e.target as HTMLTextAreaElement).value)
        resizeTitle(e.target as HTMLTextAreaElement)
    }

    useEffect(() => {
        if (titleRef.current) {
            resizeTitle(titleRef.current)
        }
    }, [])

    const [isEditingSlug, setIsEditingSlug] = useState(false)
    const [localSlug, setLocalSlug] = useState("")
    const [slugError, setSlugError] = useState<string | null>(null)

    useEffect(() => {
        if (!isEditingSlug) {
            setLocalSlug(slug || "")
            setSlugError(null)
        }
    }, [slug, isEditingSlug])

    useEffect(() => {
        if (isEditingSlug) {
            if (localSlug.trim() === '') {
                setSlugError(null)
            } else if (/\s/.test(localSlug)) {
                setSlugError("Slug cannot contain spaces")
            } else if (!/^[a-z0-9-]+$/.test(localSlug)) {
                setSlugError("Slug can only contain lowercase letters, numbers, and hyphens")
            } else if (localSlug.startsWith('-') || localSlug.endsWith('-')) {
                setSlugError("Slug cannot start or end with a hyphen")
            } else {
                setSlugError(null)
            }
        }
    }, [localSlug, isEditingSlug])

    const handleSlugClick = () => setIsEditingSlug(true)
    const handleSlugBlur = () => {
        if (slugError) {
            setIsEditingSlug(false)
            setLocalSlug(slug || "")
            return
        }
        setIsEditingSlug(false)
        if (onSlugChange) {
            const cleaned = localSlug.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
            if (cleaned) {
                onSlugChange(cleaned)
            } else if (!slug) {
                setLocalSlug("")
            }
        }
    }

    const handleSlugKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSlugBlur()
        if (e.key === 'Escape') {
            setIsEditingSlug(false)
            setLocalSlug(slug || "")
        }
    }

    const currentSlugDisplay = slug || ""

    const [isCellMenuOpen, setIsCellMenuOpen] = useState(false)
    const [menuRect, setMenuRect] = useState<DOMRect | null>(null)

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (onExcerptChange) excerptRef.current?.focus()
            else editor?.commands.focus('start')
        } else if (e.key === 'ArrowDown') {
            if (e.currentTarget.selectionStart === e.currentTarget.value.length) {
                e.preventDefault()
                if (onExcerptChange) excerptRef.current?.focus()
                else editor?.commands.focus('start')
            }
        }
    }

    const handleExcerptKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'ArrowUp') {
            if (e.currentTarget.selectionStart === 0) {
                e.preventDefault()
                titleRef.current?.focus()
            }
        } else if (e.key === 'ArrowDown') {
            if (e.currentTarget.selectionStart === e.currentTarget.value.length) {
                e.preventDefault()
                editor?.commands.focus('start')
            }
        }
    }

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                dropcursor: {
                    color: '#414BEA',
                    width: 2,
                },
            }),
            BubbleMenu,

            Placeholder.configure({
                placeholder: "Write or type '/' for commands...",
            }),
            Highlight.configure({
                multicolor: true,
            }),
            Underline,
            LinkExtension.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
            }),
            TextStyle,
            Color,
            Superscript,
            Subscript,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            ImageExtension.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        imageId: {
                            default: null,
                            parseHTML: element => element.getAttribute('data-image-id'),
                            renderHTML: attributes => {
                                if (!attributes.imageId) return {}
                                return { 'data-image-id': attributes.imageId }
                            },
                        },
                    }
                },
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        backgroundColor: {
                            default: null,
                            parseHTML: element => element.style.backgroundColor || element.getAttribute('data-background-color'),
                        },
                        textColor: {
                            default: null,
                            parseHTML: element => element.style.color || element.getAttribute('data-text-color'),
                        },
                        textAlign: {
                            default: 'left',
                            parseHTML: element => element.style.textAlign || element.getAttribute('data-text-align') || 'left',
                        },
                        verticalAlign: {
                            default: 'top',
                            parseHTML: element => element.style.verticalAlign || element.getAttribute('data-vertical-align'),
                        },
                    }
                },
                renderHTML({ HTMLAttributes }) {
                    const { backgroundColor, textColor, textAlign, verticalAlign, ...rest } = HTMLAttributes
                    const styles = []
                    if (backgroundColor) styles.push(`background-color: ${backgroundColor} !important`)
                    if (textColor) styles.push(`color: ${textColor}`)
                    if (textAlign) styles.push(`text-align: ${textAlign}`)
                    if (verticalAlign) styles.push(`vertical-align: ${verticalAlign}`)
                    
                    return ['td', { ...rest, style: styles.join('; '), 'data-background-color': backgroundColor, 'data-text-color': textColor, 'data-text-align': textAlign, 'data-vertical-align': verticalAlign }, 0]
                }
            }),
            TableHeader.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        backgroundColor: {
                            default: null,
                            parseHTML: element => element.style.backgroundColor || element.getAttribute('data-background-color'),
                        },
                        textColor: {
                            default: null,
                            parseHTML: element => element.style.color || element.getAttribute('data-text-color'),
                        },
                        textAlign: {
                            default: 'left',
                            parseHTML: element => element.style.textAlign || element.getAttribute('data-text-align') || 'left',
                        },
                        verticalAlign: {
                            default: 'top',
                            parseHTML: element => element.style.verticalAlign || element.getAttribute('data-vertical-align'),
                        },
                    }
                },
                renderHTML({ HTMLAttributes }) {
                    const { backgroundColor, textColor, textAlign, verticalAlign, ...rest } = HTMLAttributes
                    const styles = []
                    if (backgroundColor) styles.push(`background-color: ${backgroundColor} !important`)
                    if (textColor) styles.push(`color: ${textColor}`)
                    if (textAlign) styles.push(`text-align: ${textAlign}`)
                    if (verticalAlign) styles.push(`vertical-align: ${verticalAlign}`)
                    
                    return ['th', { ...rest, style: styles.join('; '), 'data-background-color': backgroundColor, 'data-text-color': textColor, 'data-text-align': textAlign, 'data-vertical-align': verticalAlign }, 0]
                }
            }),
            ImageUpload,
            SlashCommands.configure({
                suggestion: suggestionConfig,
            }),
            DragHandleExtension.configure({
                render: () => {
                    const el = document.createElement('div')
                    el.className = 'custom-drag-handle'
                    setDragHandleElement(el)
                    return el
                },
                computePositionConfig: {
                    placement: 'left' as const,
                },
            }),
        ],
        content: initialContent || '',
        onUpdate: ({ editor }) => {
            const json = editor.getJSON()
            onUpdateContent(json)

            // Collect all image IDs currently present in the editor
            const currentImageIds = new Set<string>()
            editor.state.doc.descendants((node) => {
                if (node.type.name === 'image' && node.attrs.imageId) {
                    currentImageIds.add(node.attrs.imageId)
                }
            })

            // Mark these as "uploaded" if we haven't seen them before
            currentImageIds.forEach(id => {
                if (!allUploadedIds.current.has(id)) {
                    allUploadedIds.current.add(id)
                }
            })

            // If an ID was uploaded previously but is NO LONGER in the editor,
            // it was deleted by the user via UI or keyboard.
            allUploadedIds.current.forEach(id => {
                if (!currentImageIds.has(id)) {
                    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/upload/${id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    }).catch(err => Sentry.captureException(err))
                    
                    allUploadedIds.current.delete(id)
                }
            })
        },
        editorProps: {
            attributes: {
                class: 'prose prose-blue max-w-none focus:outline-none min-h-[500px] pb-4 pr-4 pl-8 pt-8',
            },
            handleKeyDown: (view, event) => {
                // TipTap/ProseMirror's default `Mod+A` selects too broadly inside table cells.
                // If we end up with a node-level selection (e.g. the whole table), Backspace can delete
                // the entire table instead of clearing only the cell's contents.
                if (
                    event.key?.toLowerCase?.() === 'a' &&
                    (event.ctrlKey || event.metaKey)
                ) {
                    const { state } = view
                    const { $from } = state.selection

                    // Find the nearest table cell/header ancestor and select only its inner content.
                    let cellDepth: number | null = null
                    for (let d = $from.depth; d > 0; d--) {
                        const node = $from.node(d)
                        if (!node) continue
                        if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
                            cellDepth = d
                            break
                        }
                    }

                    if (cellDepth !== null) {
                        event.preventDefault()
                        const from = $from.start(cellDepth)
                        const to = $from.end(cellDepth)

                        view.dispatch(
                            state.tr
                                .setSelection(TextSelection.create(state.doc, from, to))
                                .scrollIntoView()
                        )
                        return true
                    }
                }

                if ((event.key === 'ArrowUp' || event.key === 'Backspace') && view.state.selection.empty) {
                    // Check if the cursor is exactly at the beginning of the editor
                    if (view.state.selection.$anchor.pos === 1 || view.state.selection.$anchor.pos === 0) {
                        const targetElement = excerptRef.current || titleRef.current;
                        targetElement?.focus()
                        
                        // Let backspace trigger focus, but block it from doing anything else if empty
                        if (event.key === 'Backspace' && view.state.doc.textContent.length === 0) {
                            return true
                        }
                        return true
                    }
                }
                return false
            }
        },
        immediatelyRender: false,
    })

    const handlePlusClick = (e: React.MouseEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        setMenuPosition({ top: rect.top, left: rect.left + 30 })
        setMenuVisible(true)
    }

    const handleMenuSelect = (type: string, attrs?: any) => {
        if (!editor) return

        // Insert at the current selection/focus
        editor.chain().focus().insertContent({ type, attrs }).run()
        setMenuVisible(false)
    }

    if (!editor) return null

    return (
        <div 
            ref={editorRef} 
            className="w-full border border-gray-200 flex bg-white relative"
        >
            <div className={`flex-1 transition-all duration-300 ${isSuggestionsOpen ? 'max-w-[calc(100%-350px)]' : 'max-w-full'}`}>
                <div className="px-[70px]">
                    <div className="flex justify-end pt-4 -mb-4 sticky top-0 z-20">
                        <button
                            onClick={() => setIsSuggestionsOpen(!isSuggestionsOpen)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold transition-all shadow-sm cursor-pointer ${
                                isSuggestionsOpen 
                                ? "bg-gray-900 text-white" 
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                            }`}
                        >
                            {isSuggestionsOpen ? <LinkIcon className="size-3.5" /> : <LinkIcon className="size-3.5" />}
                            {isSuggestionsOpen ? "Hide Suggestions" : "Link Suggestions"}
                        </button>
                    </div>

            <div className="pl-[2px] mb-2 mt-4 space-y-3 px-0">
                <textarea
                    ref={titleRef}
                    value={title}
                    placeholder="Blog title"
                    rows={1}
                    onChange={handleTitleInput}
                    onKeyDown={handleTitleKeyDown}
                    className={`w-full resize-none outline-none text-4xl font-bold placeholder:text-gray-300 text-gray-800 overflow-hidden transition-colors rounded-sm p-1 -ml-1 ${showErrors && !title.trim() ? "bg-red-50" : "bg-transparent"}`}
                />

                {onExcerptChange && (
                    <div className="flex flex-col ml-1 pb-4 gap-1.5 group w-full">
                        <textarea
                            ref={excerptRef}
                            value={excerpt}
                            placeholder="write a summary (optional)"
                            rows={2}
                            onKeyDown={handleExcerptKeyDown}
                            onChange={(e) => {
                                const text = e.target.value;
                                const words = text.trim() ? text.trim().split(/\s+/) : [];
                                if (words.length <= 50) {
                                    onExcerptChange(text);
                                } else {
                                    // limit to 50 words
                                    onExcerptChange(words.slice(0, 50).join(" "));
                                }
                            }}
                            className={`w-full resize-none outline-none text-base placeholder:text-gray-400 text-gray-700 transition-colors rounded-md p-3 bg-gray-50 border border-gray-100 shrink-0 hover:bg-gray-100/50 focus:bg-white focus:border-gray-200 focus:shadow-sm`}
                        />
                        <span className="text-[10px] text-gray-400 font-medium px-1">
                            {excerpt.trim() ? excerpt.trim().split(/\s+/).length : 0} / 50 words
                        </span>
                    </div>
                )}

                {(currentSlugDisplay || isEditingSlug) && (
                    <div className="flex flex-col ml-1 pb-4 gap-1.5 group">
                        <div className="flex items-center text-sm font-medium">
                            <span className="text-gray-400">corporateblog.in/blog/</span>
                            {isEditingSlug ? (
                                <input 
                                    autoFocus
                                    type="text"
                                    value={localSlug}
                                    onChange={(e) => setLocalSlug(e.target.value)}
                                    placeholder="your-post-slug"
                                    className="bg-transparent border-none px-1 text-sm text-gray-900 focus:outline-none focus:ring-0 placeholder:text-gray-300 font-medium"
                                    onBlur={handleSlugBlur}
                                    onKeyDown={handleSlugKeyDown}
                                />
                            ) : (
                                <span 
                                    className="cursor-text text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-1 rounded-sm transition-colors"
                                    onClick={handleSlugClick}
                                >
                                    {currentSlugDisplay}
                                </span>
                            )}
                        </div>
                        {isEditingSlug && slugError && (
                            <span className="text-xs text-red-500 font-medium flex items-center gap-1.5">
                                <AlertCircle className="size-3.5" /> 
                                {slugError}
                            </span>
                        )}
                    </div>
                )}

                {/* Categories Section */}
                <div className="flex flex-wrap items-center gap-2 ml-1 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {categoryIds.map(catId => {
                            const cat = availableCategories.find(c => c.id === catId)
                            return cat ? (
                                <span 
                                    key={cat.id}
                                    className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-sm border border-gray-200 group/tag hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all cursor-default"
                                >
                                    {cat.name}
                                    <button 
                                        onClick={() => toggleCategory(cat.id)}
                                        className="cursor-pointer hover:bg-red-100 rounded-sm p-0.5"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </span>
                            ) : null
                        })}
                    </div>
                    
                    {categoryIds.length < 3 && (
                        <div className="relative">
                            <button 
                                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                                className={`cursor-pointer flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-sm border border-dashed transition-all ${showErrors && categoryIds.length === 0 ? "border-red-400 text-red-500 bg-red-50/50 hover:bg-red-50" : "border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-400/10 hover:bg-gray-50"}`}
                            >
                                <Plus className="size-3" />
                                Add category
                            </button>

                        {isCategoryMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                                <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Select Categories (Max 3)</span>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {availableCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            className="cursor-pointer w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors group"
                                        >
                                            <span className={`font-medium ${categoryIds.includes(cat.id) ? "text-[#414BEA]" : "text-gray-600"}`}>
                                                {cat.name}
                                            </span>
                                            {categoryIds.includes(cat.id) ? (
                                                <div className="size-4 bg-[#414BEA] rounded-full flex items-center justify-center">
                                                    <Check className="size-2.5 text-white" />
                                                </div>
                                            ) : (
                                                <Plus className="size-3 text-gray-300 group-hover:text-gray-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {isCategoryMenuOpen && (
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setIsCategoryMenuOpen(false)}
                            />
                        )}
                    </div>
                    )}
                    {showErrors && categoryIds.length === 0 && (
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-tight ml-1">Select at least one</span>
                    )}
                </div>

                {!bannerUrl && (
                    <>
                        <input
                            type="file"
                            accept="image/*"
                            id="banner-upload"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    setIsBannerUploading(true)
                                    try {
                                        const formData = new FormData()
                                        formData.append('file', file)
                                        
                                        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/upload`, {
                                            method: 'POST',
                                            credentials: 'include',
                                            body: formData,
                                        })
                                        
                                        if (!response.ok) throw new Error('Upload failed')
                                        
                                        const result = await response.json()
                                        onBannerChange(result.url, result.imageId)
                                    } catch (err: any) {
                                        Sentry.captureException(err)
                                        toast.error(err.message || 'Failed to upload banner image.')
                                    } finally {
                                        setIsBannerUploading(false)
                                    }
                                }
                                e.target.value = ''
                            }}
                            />
                        <button 
                            onClick={() => document.getElementById('banner-upload')?.click()}
                            disabled={isBannerUploading}
                            className={`h-48 cursor-pointer w-full flex border border-dashed rounded-sm justify-center py-10 items-center gap-2 text-sm transition-colors group font-medium disabled:opacity-50 disabled:cursor-not-allowed ${showErrors && !bannerUrl ? "border-red-400 bg-red-50/50 text-red-400" : "border-gray-400 text-gray-400 hover:text-gray-700"}`}
                            >
                            {isBannerUploading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin text-blue-500" />
                                    <span>Uploading cover...</span>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="size-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                    Add cover Image
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>

            {bannerUrl ? (
                <div className="relative group w-full h-48 md:h-64 mb-6">
                    <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover rounded-sm" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                    <button 
                        onClick={() => onBannerChange(null, null)}
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-sm font-medium px-3 py-1.5 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white text-gray-700 flex items-center gap-1.5 border border-gray-200"
                    >
                        <X className="size-3.5" />
                        Remove Cover
                    </button>
                </div>
            ) : null}

            <div className="relative mt-5">
                {dragHandleElement && createPortal(
                    <BlockHandle onAddClick={handlePlusClick} />,
                    dragHandleElement
                )}
                
                {menuVisible && (
                    <BlockMenu 
                        position={menuPosition}
                        onSelect={handleMenuSelect}
                        onClose={() => setMenuVisible(false)}
                    />
                )}

                <EditorBubbleMenu editor={editor} />
                <TableCellHandle 
                    editor={editor} 
                    onOpenMenu={(rect: DOMRect) => {
                        setMenuRect(rect)
                        setIsCellMenuOpen(true)
                    }} 
                />
                <CellPropertyMenu 
                    editor={editor} 
                    isOpen={isCellMenuOpen} 
                    onClose={() => setIsCellMenuOpen(false)} 
                />

                <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Suggestions Sidebar */}
        {isSuggestionsOpen && (
            <div className="w-[350px] border-l border-gray-100 flex-shrink-0 sticky top-0 h-[85vh]">
                <LinkSuggestions editor={editor} postId={postId || null} />
            </div>
        )}
      </div>
    )
}
