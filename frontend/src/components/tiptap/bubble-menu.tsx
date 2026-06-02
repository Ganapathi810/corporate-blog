"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import type { MarkType } from '@tiptap/pm/model'
import type { Mark } from '@tiptap/pm/model'
import { 
    Bold as BoldIcon, 
    Italic as ItalicIcon, 
    Underline as UnderlineIcon,
    Strikethrough as StrikeIcon, 
    Code as CodeIcon,
    Link as LinkIcon,
    ChevronDown,
    MoreVertical,
    Highlighter,
    ExternalLink,
    Trash2,
    CornerDownLeft,
    Superscript as SuperscriptIcon,
    Subscript as SubscriptIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'

interface EditorBubbleMenuProps {
    editor: Editor
}

const TEXT_COLORS = [
    { name: 'Default', color: '#1F1F1B' },
    { name: 'Gray', color: '#525252' },
    { name: 'Brown', color: '#3F2A20' },
    { name: 'Orange', color: '#9A3412' },
    { name: 'Yellow', color: '#854D0E' },
    { name: 'Green', color: '#115E59' },
    { name: 'Blue', color: '#075985' },
    { name: 'Purple', color: '#5B21B6' },
    { name: 'Pink', color: '#9D174D' },
    { name: 'Red', color: '#991B1B' },
]

const HIGHLIGHT_COLORS = [
    { name: 'Default', color: 'transparent' },
    { name: 'Gray', color: '#D4D4D8' },
    { name: 'Brown', color: '#D6CCC2' },
    { name: 'Orange', color: '#FED7AA' },
    { name: 'Yellow', color: '#FDE68A' },
    { name: 'Green', color: '#A7F3D0' },
    { name: 'Blue', color: '#BAE6FD' },
    { name: 'Purple', color: '#DDD6FE' },
    { name: 'Pink', color: '#FBCFE8' },
    { name: 'Red', color: '#FECACA' },
]


export const EditorBubbleMenu = ({ editor }: EditorBubbleMenuProps) => {
    const [isColorMenuOpen, setIsColorMenuOpen] = useState(false)
    const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false)
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [, forceRerender] = useState(0)
    const rafId = useRef<number | null>(null)

    const colorMenuRef = useRef<HTMLDivElement>(null)
    const linkMenuRef = useRef<HTMLDivElement>(null)
    const moreMenuRef = useRef<HTMLDivElement>(null)

    // Ensure the bubble menu reflects editor marks (bold/italic/...) on reselection,
    // including inside table cells. TipTap's Editor instance mutates internally and
    // does not automatically trigger React renders.
    // Keep a ref to the link menu state so our editor event listener can access the latest
    // value without needing to re-register the effect and potentially causing loops.
    const isLinkMenuOpenRef = useRef(isLinkMenuOpen)
    useEffect(() => {
        isLinkMenuOpenRef.current = isLinkMenuOpen
    }, [isLinkMenuOpen])

    useEffect(() => {
        if (!editor) return

        const updateFromEditor = () => {
            if (rafId.current !== null) return
            rafId.current = window.requestAnimationFrame(() => {
                rafId.current = null
                forceRerender((v) => v + 1)
            })

            // Keep link input in sync with current selection, but ONLY if not actively editing
            if (!isLinkMenuOpenRef.current) {
                if (editor.isActive('link')) {
                    const next = editor.getAttributes('link').href || ''
                    setLinkUrl((prev) => (prev === next ? prev : next))
                } else {
                    setLinkUrl((prev) => (prev === '' ? prev : ''))
                }
            }
        }

        editor.on('selectionUpdate', updateFromEditor)
        editor.on('transaction', updateFromEditor)

        return () => {
            if (rafId.current !== null) {
                window.cancelAnimationFrame(rafId.current)
                rafId.current = null
            }
            editor.off('selectionUpdate', updateFromEditor)
            editor.off('transaction', updateFromEditor)
        }
    }, [editor])

    const isMarkActiveAnywhere = (markName: string) => {
        const { state } = editor
        const markType: MarkType | undefined = state.schema.marks[markName]
        if (!markType) return false

        const { from, to, empty, $from } = state.selection

        // Cursor selection: rely on storedMarks or marks at cursor.
        if (empty) {
            const marks = state.storedMarks ?? $from.marks()
            return marks.some(m => m.type === markType)
        }

        // Range selection: consider the mark active if ANY text node in the range has it.
        let found = false
        state.doc.nodesBetween(from, to, (node) => {
            if (found) return false
            if (!node.isText) return
            if (markType.isInSet(node.marks)) {
                found = true
                return false
            }
        })
        return found
    }

    const getMarkAttrFromSelection = (markName: string, attrName: string): string | null => {
        const { state } = editor
        const markType: MarkType | undefined = state.schema.marks[markName]
        if (!markType) return null

        const { from, to, empty, $from } = state.selection

        const readAttr = (m: Mark) => {
            const v = (m.attrs as any)?.[attrName]
            return typeof v === 'string' && v.length > 0 ? v : null
        }

        if (empty) {
            const marks = state.storedMarks ?? $from.marks()
            for (const m of marks) {
                if (m.type === markType) return readAttr(m)
            }
            return null
        }

        let found: string | null = null
        state.doc.nodesBetween(from, to, (node) => {
            if (found) return false
            if (!node.isText) return
            const m = markType.isInSet(node.marks)
            if (m) {
                found = readAttr(m)
                return false
            }
        })
        return found
    }

    const getActiveTextColor = (): string => {
        // 1) Prefer explicit textStyle mark color (set via bubble menu color picker)
        const markColor = getMarkAttrFromSelection('textStyle', 'color')
        if (markColor) return markColor

        // 2) If inside a table cell, color is often stored as a cell attribute (`data-text-color`)
        try {
            const { $from } = editor.state.selection
            let node = editor.view.domAtPos($from.pos).node as HTMLElement
            if (node?.nodeType === 3) node = node.parentElement as HTMLElement
            const cell = node?.closest?.('td, th') as HTMLElement | null
            const cellColor = cell?.getAttribute?.('data-text-color') || (cell as any)?.dataset?.textColor || cell?.style?.color
            if (cellColor) return cellColor
        } catch {
            // ignore
        }

        return TEXT_COLORS[0].color
    }

    const isBoldActive = (): boolean => {
        if (isMarkActiveAnywhere('bold')) return true

        // If a whole cell is styled via CSS/attributes (not a mark), detect bold via computed style.
        try {
            const { $from } = editor.state.selection
            let node = editor.view.domAtPos($from.pos).node as HTMLElement
            if (node?.nodeType === 3) node = node.parentElement as HTMLElement
            const cell = node?.closest?.('td, th') as HTMLElement | null
            if (!cell) return false
            const weight = window.getComputedStyle(cell).fontWeight
            const numeric = Number.parseInt(weight, 10)
            if (Number.isFinite(numeric)) return numeric >= 600
            return weight === 'bold' || weight === 'bolder'
        } catch {
            return false
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (colorMenuRef.current && !colorMenuRef.current.contains(target)) {
                setIsColorMenuOpen(false)
            }
            if (linkMenuRef.current && !linkMenuRef.current.contains(target) && !target.closest('.link-trigger')) {
                setIsLinkMenuOpen(false)
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(target) && !target.closest('.more-trigger')) {
                setIsMoreMenuOpen(false)
            }
        }
        if (isColorMenuOpen || isLinkMenuOpen || isMoreMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isColorMenuOpen, isLinkMenuOpen, isMoreMenuOpen])

    if (!editor) return null

    const handleLinkSubmit = () => {
        if (linkUrl === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
        }
        setIsLinkMenuOpen(false)
    }

    const removeLink = () => {
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
        setLinkUrl('')
        setIsLinkMenuOpen(false)
    }

    const activeColor = getActiveTextColor()
    const activeHighlight = editor.getAttributes('highlight').color || 'transparent'
    const hasCustomTextColor = activeColor !== TEXT_COLORS[0].color

    return (
        <BubbleMenu 
            editor={editor} 
            shouldShow={({ state }) => {
                const { selection } = state
                const { empty } = selection
                
                if (empty) return false

                // Hide menu when selecting multiple cells (dragging to merge, etc.)
                const isCellSelection = selection.constructor.name === 'CellSelection' || (selection as any).isCellSelection
                if (isCellSelection) return false

                return true
            }}
        >
            <div className="flex flex-col items-center gap-2" contentEditable={false}>
                {isMoreMenuOpen && (
                    <div ref={moreMenuRef} className="flex items-center bg-white border border-gray-200 rounded-sm shadow-[0_3px_10px_rgb(0,0,0,0.2)] p-1 animate-in fade-in slide-in-from-bottom-2 duration-200 ring-1 ring-black/5">
                        <Tooltip content="Superscript">
                            <button
                                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                                className={cn(
                                    "p-1.5 rounded-sm transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600 cursor-pointer",
                                    editor.isActive('superscript') && "bg-blue-100 text-blue-700"
                                )}
                            >
                                <SuperscriptIcon className="size-4" strokeWidth={2.5} />
                            </button>
                        </Tooltip>
                        <Tooltip content="Subscript">
                            <button
                                onClick={() => editor.chain().focus().toggleSubscript().run()}
                                className={cn(
                                    "p-1.5 rounded-sm transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600 ml-0.5 cursor-pointer",
                                    editor.isActive('subscript') && "bg-blue-100 text-blue-700"
                                )}
                            >
                                <SubscriptIcon className="size-4" strokeWidth={2.5} />
                            </button>
                        </Tooltip>

                        <div className="w-px h-6 bg-gray-200 mx-2" />

                        <Tooltip content="Align left">
                            <button
                                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                className={cn(
                                    "p-1.5 rounded-sm transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600 cursor-pointer",
                                    editor.isActive({ textAlign: 'left' }) && "bg-blue-100 text-blue-700"
                                )}
                            >
                                <AlignLeft className="size-4" strokeWidth={2.5} />
                            </button>
                        </Tooltip>
                        <Tooltip content="Align center">
                            <button
                                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                className={cn(
                                    "p-1.5 rounded-sm transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600 ml-0.5 cursor-pointer",
                                    editor.isActive({ textAlign: 'center' }) && "bg-blue-100 text-blue-700"
                                )}
                            >
                                <AlignCenter className="size-4" strokeWidth={2.5} />
                            </button>
                        </Tooltip>
                        <Tooltip content="Align right">
                            <button
                                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                className={cn(
                                    "p-1.5 rounded-sm transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600 ml-0.5 cursor-pointer",
                                    editor.isActive({ textAlign: 'right' }) && "bg-blue-100 text-blue-700"
                                )}
                            >
                                <AlignRight className="size-4" strokeWidth={2.5} />
                            </button>
                        </Tooltip>
                        <Tooltip content="Align justify">
                            <button
                                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                                className={cn(
                                    "p-1.5 rounded-sm transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600 ml-0.5 cursor-pointer",
                                    editor.isActive({ textAlign: 'justify' }) && "bg-blue-100 text-blue-700"
                                )}
                            >
                                <AlignJustify className="size-4" strokeWidth={2.5} />
                            </button>
                        </Tooltip>
                    </div>
                )}

                <div className="flex items-center bg-white border border-gray-200 rounded-sm shadow-[0_3px_10px_rgb(0,0,0,0.2)] p-1.5 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                    <Tooltip content="Bold">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={cn(
                                "p-1.5 rounded-sm transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600 cursor-pointer",
                                isBoldActive() && "bg-blue-100 text-blue-700 font-bold"
                            )}
                        >
                            <BoldIcon className="size-4" strokeWidth={2.5} />
                        </button>
                    </Tooltip>
                    <Tooltip content="Italic">
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={cn(
                                "p-1.5 rounded-sm transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600 ml-0.5 cursor-pointer",
                                isMarkActiveAnywhere('italic') && "bg-blue-100 text-blue-700"
                            )}
                        >
                            <ItalicIcon className="size-4" strokeWidth={2.5} />
                        </button>
                    </Tooltip>
                    <Tooltip content="Underline">
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={cn(
                                "p-1.5 rounded-sm transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600 ml-0.5 cursor-pointer",
                                isMarkActiveAnywhere('underline') && "bg-blue-100 text-blue-700"
                            )}
                        >
                            <UnderlineIcon className="size-4" strokeWidth={2.5} />
                        </button>
                    </Tooltip>
                    <Tooltip content="Strikethrough">
                        <button
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={cn(
                                "p-1.5 rounded-sm transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600 ml-0.5 cursor-pointer",
                                isMarkActiveAnywhere('strike') && "bg-blue-100 text-blue-700"
                            )}
                        >
                            <StrikeIcon className="size-4" strokeWidth={2.5} />
                        </button>
                    </Tooltip>
                    <Tooltip content="Code">
                        <button
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            className={cn(
                                "p-1.5 rounded-sm transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600 ml-0.5 cursor-pointer",
                                isMarkActiveAnywhere('code') && "bg-blue-100 text-blue-700"
                            )}
                        >
                            <CodeIcon className="size-4" strokeWidth={2.5} />
                        </button>
                    </Tooltip>
                    
                    <div className="w-px h-6 bg-gray-200 mx-2" />
                    
                    <div className="relative" ref={linkMenuRef}>
                        <Tooltip content="Link">
                            <button
                                onClick={() => setIsLinkMenuOpen(!isLinkMenuOpen)}
                                className={cn(
                                    "p-1.5 rounded-sm transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600 link-trigger cursor-pointer",
                                    (editor.isActive('link') || isLinkMenuOpen) && "bg-blue-100 text-blue-700 font-medium"
                                )}
                            >
                                <LinkIcon className="size-4" strokeWidth={2.5} />
                            </button>
                        </Tooltip>

                        {isLinkMenuOpen && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[430px] bg-white border border-gray-200 rounded-sm shadow-2xl p-1 z-10000 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center gap-1 p-1">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Paste a link..."
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        onKeyUp={(e) => {
                                            e.stopPropagation()
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleLinkSubmit()
                                            }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-gray-400"
                                    />
                                    <button
                                        onClick={handleLinkSubmit}
                                        className="p-2 rounded-sm hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                    >
                                        <CornerDownLeft className="size-4" />
                                    </button>
                                    
                                    <div className="w-px h-6 bg-gray-200 mx-1" />

                                    <button
                                        onClick={() => {
                                            if (linkUrl) window.open(linkUrl, '_blank')
                                        }}
                                        disabled={!linkUrl}
                                        className="p-2 rounded-sm hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        <ExternalLink className="size-4" />
                                    </button>
                                    <button
                                        onClick={removeLink}
                                        className="p-2 rounded-sm hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={colorMenuRef}>
                        <Tooltip content="Text color">
                            <button
                                onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                                className={cn(
                                    "flex items-center gap-0.5 p-1.5 rounded-sm transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600 ml-0.5 cursor-pointer",
                                    hasCustomTextColor && "bg-blue-100 text-blue-700"
                                )}
                            >
                                <div className="relative flex flex-col items-center">
                                    <span className="text-[14px] font-bold leading-none" style={{ color: activeColor }}>A</span>
                                    <div className="w-3.5 h-0.5 mt-0.5" style={{ backgroundColor: activeColor || '#37352F' }} />
                                </div>
                                <ChevronDown className="size-3 text-gray-400" />
                            </button>
                        </Tooltip>

                        {isColorMenuOpen && (
                            <div className="absolute top-full left-1/2 -0 mt-2 w-64 bg-white border border-gray-200 rounded-sm shadow-2xl p-4 z-10000 animate-in fade-in zoom-in-95 duration-200">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Recently Used</h3>
                                        <div className="flex gap-3">
                                            <div className="size-6 rounded-full border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors">
                                                <span className="text-blue-500 font-bold text-xs">A</span>
                                            </div>
                                            <div className="size-6 rounded-full bg-red-100 cursor-pointer hover:opacity-80" />
                                            <div className="size-6 rounded-full bg-blue-100 cursor-pointer hover:opacity-80" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Text Color</h3>
                                        <div className="grid grid-cols-5 gap-2">
                                            {TEXT_COLORS.map((tc) => (
                                                <Tooltip key={tc.name} content={tc.name}>
                                                    <button
                                                        onClick={() => {
                                                            editor.chain().focus().setColor(tc.color).run()
                                                            setIsColorMenuOpen(false)
                                                        }}
                                                        className="size-8 flex items-center justify-center rounded-sm hover:bg-blue-50 transition-colors cursor-pointer"
                                                    >
                                                        <span className="text-lg font-medium" style={{ color: tc.color }}>A</span>
                                                    </button>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Highlight Color</h3>
                                        <div className="grid grid-cols-5 gap-2">
                                            {HIGHLIGHT_COLORS.map((hc) => (
                                                <Tooltip key={hc.name} content={hc.name}>
                                                    <button
                                                        onClick={() => {
                                                            if (hc.color === 'transparent') {
                                                                editor.chain().focus().unsetHighlight().run()
                                                            } else {
                                                                editor.chain().focus().setHighlight({ color: hc.color }).run()
                                                            }
                                                            setIsColorMenuOpen(false)
                                                        }}
                                                        className="size-8 flex items-center justify-center rounded-sm hover:bg-blue-50 transition-colors cursor-pointer"
                                                    >
                                                        <div 
                                                            className="size-6 rounded-full border border-gray-100" 
                                                            style={{ backgroundColor: hc.color }}
                                                        />
                                                    </button>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-gray-200 mx-2" />

                    <Tooltip content="More options">
                        <button 
                            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                            className={cn(
                                "p-1.5 rounded-sm transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600 ml-0.5 more-trigger cursor-pointer",
                                isMoreMenuOpen && "bg-blue-100 text-blue-700"
                            )}
                        >
                            <MoreVertical className="size-4" strokeWidth={2.5} />
                        </button>
                    </Tooltip>
                </div>
            </div>
        </BubbleMenu>
    )
}
