"use client";

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Editor } from '@tiptap/react'
import { 
    AlignLeft, 
    AlignCenter, 
    AlignRight, 
    ArrowUpToLine,
    MoveHorizontal,
    ArrowDownToLine,
    Palette,
    ChevronRight,
    ChevronLeft,
    GripVertical,
    Merge,
    Split,
    SquareX
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CellPropertyMenuProps {
    editor: Editor
    isOpen: boolean
    onClose: () => void
}

export const CellPropertyMenu = ({ editor, isOpen, onClose }: CellPropertyMenuProps) => {
    const [activeSubmenu, setActiveSubmenu] = useState<'alignment' | 'color' | null>(null)
    const [rect, setRect] = useState<DOMRect | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    // Update position whenever selection, transaction, scroll or resize happens
    useEffect(() => {
        const update = () => {
            if (!editor || !isOpen) return

            const { selection } = editor.state
            const dom = editor.view.dom
            let selectedCell = dom.querySelector('.selectedCell')
            
            if (!selectedCell) {
                const { $from } = selection
                let node = editor.view.domAtPos($from.pos).node as HTMLElement
                if (node.nodeType === 3) node = node.parentElement as HTMLElement
                selectedCell = node.closest('td, th')
            }

            if (selectedCell) {
                setRect(selectedCell.getBoundingClientRect())
            } else {
                // If it's a structural update (drag/resize) and markers are missing temporarily, 
                // don't close if we are still inside a table cell.
                const isStillInCell = editor.isActive('tableCell') || editor.isActive('tableHeader')
                if (!isStillInCell) {
                    onClose()
                }
            }
        }

        if (isOpen) {
            update()
            editor.on('selectionUpdate', update)
            editor.on('transaction', update)
            window.addEventListener('resize', update)
            window.addEventListener('scroll', update, true)
        }

        return () => {
            editor.off('selectionUpdate', update)
            editor.off('transaction', update)
            window.removeEventListener('resize', update)
            window.removeEventListener('scroll', update, true)
        }
    }, [editor, isOpen, onClose])

    // Reset submenu when closed
    useEffect(() => {
        if (!isOpen) {
            setActiveSubmenu(null)
        }
    }, [isOpen])

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    if (!editor || !isOpen || !rect) return null

    const setVerticalAlign = (alignment: string) => {
        editor.chain().focus().setCellAttribute('verticalAlign', alignment).run()
    }

    const setBackgroundColor = (color: string | null) => {
        editor.chain().focus().setCellAttribute('backgroundColor', color).run()
    }

    const setTextColor = (color: string | null) => {
        editor.chain().focus().setCellAttribute('textColor', color).run()
    }

    const bgColors = [
        { name: 'Default', value: null, class: 'bg-white border border-gray-200' },
        { name: 'Gray', value: '#E2E8F0', class: 'bg-slate-200' },
        { name: 'Brown', value: '#E7E5E4', class: 'bg-stone-200' },
        { name: 'Orange', value: '#FFEDD5', class: 'bg-orange-100' },
        { name: 'Yellow', value: '#FEF9C3', class: 'bg-yellow-100' },
        { name: 'Green', value: '#DCFCE7', class: 'bg-green-100' },
        { name: 'Blue', value: '#DBEAFE', class: 'bg-blue-100' },
        { name: 'Purple', value: '#F3E8FF', class: 'bg-purple-100' },
        { name: 'Pink', value: '#FCE7F3', class: 'bg-pink-100' },
        { name: 'Red', value: '#FEE2E2', class: 'bg-red-100' },
    ]

    const textColors = [
        { name: 'Default', value: null, colorClass: 'text-gray-900' },
        { name: 'Gray', value: '#525252', colorClass: 'text-[#525252]' },
        { name: 'Brown', value: '#3F2A20', colorClass: 'text-[#3F2A20]' },
        { name: 'Orange', value: '#9A3412', colorClass: 'text-[#9A3412]' },
        { name: 'Yellow', value: '#854D0E', colorClass: 'text-[#854D0E]' },
        { name: 'Green', value: '#115E59', colorClass: 'text-[#115E59]' },
        { name: 'Blue', value: '#075985', colorClass: 'text-[#075985]' },
        { name: 'Purple', value: '#5B21B6', colorClass: 'text-[#5B21B6]' },
        { name: 'Pink', value: '#9D174D', colorClass: 'text-[#9D174D]' },
        { name: 'Red', value: '#991B1B', colorClass: 'text-[#991B1B]' },
    ]

    return createPortal(
        <div 
            ref={menuRef}
            style={{
                position: 'fixed',
                top: rect.top + rect.height / 2,
                left: rect.right + 10,
                zIndex: 100,
            }}
            className="flex items-start gap-1 pointer-events-auto"
        >
            {/* Main Menu ... */}
            <div 
                style={{ transform: 'translateY(-50%)' }}
                className="bg-white rounded-sm shadow-xl border border-gray-200 py-1.5 min-w-[160px] animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
                onMouseLeave={(e) => {
                    if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                        setActiveSubmenu(null)
                    }
                }}
            >
                <div className="flex flex-col">
                    <button
                        onMouseEnter={() => setActiveSubmenu('color')}
                        className={cn(
                            "flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 text-sm transition-colors text-gray-700 w-full cursor-pointer",
                            activeSubmenu === 'color' && "bg-gray-100"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Palette className="size-4 text-gray-500" />
                            <span>Color</span>
                        </div>
                        <ChevronRight className="size-4 text-gray-400" />
                    </button>
                    <button
                        onMouseEnter={() => setActiveSubmenu('alignment')}
                        className={cn(
                            "flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 text-sm transition-colors text-gray-700 w-full cursor-pointer",
                            activeSubmenu === 'alignment' && "bg-gray-100"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <GripVertical className="size-4 text-gray-500 rotate-90" />
                            <span>Alignment</span>
                        </div>
                        <ChevronRight className="size-4 text-gray-400" />
                    </button>

                    <div className="h-px bg-gray-100 my-1 mx-1" />

                    {editor.can().mergeCells() && (
                        <button
                            onClick={() => { editor.chain().focus().mergeCells().run(); onClose(); }}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm text-gray-700 w-full cursor-pointer"
                        >
                            <Merge className="size-4 text-gray-500" />
                            <span>Merge cells</span>
                        </button>
                    )}

                    {editor.can().splitCell() && (
                        <button
                            onClick={() => { editor.chain().focus().splitCell().run(); onClose(); }}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm text-gray-700 w-full cursor-pointer"
                        >
                            <Split className="size-4 text-gray-500" />
                            <span>Split cell</span>
                        </button>
                    )}

                    <button
                        onClick={() => {
                            editor.chain().focus().command(({ tr, state }) => {
                                const { selection } = state
                                let foundRow: any = null
                                
                                // Find the row containing the selection
                                state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
                                    if (node.type.name === 'tableRow') {
                                        foundRow = { node, pos }
                                        return false
                                    }
                                })

                                if (foundRow) {
                                    const cells: { node: any, pos: number }[] = []
                                    foundRow.node.forEach((cell: any, offset: number) => {
                                        cells.push({ node: cell, pos: foundRow.pos + offset + 1 })
                                    })

                                    // Clear content of each cell in reverse to avoid position shifts
                                    for (let i = cells.length - 1; i >= 0; i--) {
                                        const { node: cell, pos: cellPos } = cells[i]
                                        tr.delete(cellPos, cellPos + cell.content.size)
                                        // Insert an empty paragraph to maintain structure
                                        const paragraph = state.schema.nodes.paragraph.create()
                                        tr.insert(cellPos, paragraph)
                                    }
                                    return true
                                }
                                return false
                            }).run()
                            onClose()
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm text-gray-700 w-full cursor-pointer"
                    >
                        <SquareX className="size-4 text-gray-500" />
                        <span>Clear row contents</span>
                    </button>
                </div>
            </div>

            {/* Submenus ... */}
            {activeSubmenu === 'alignment' && (
                <div 
                    style={{ transform: 'translateY(-50%)' }}
                    className="bg-white rounded-sm shadow-xl border border-gray-200 py-1.5 min-w-[160px] animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
                >
                    <div className="flex flex-col">
                        <div className="px-3 py-1 text-[11px] font-semibold text-gray-800 uppercase tracking-wider">
                            Horizontal
                        </div>
                        <button
                            onClick={() => { editor.chain().focus().setCellAttribute('textAlign', 'left').run(); onClose(); }}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer"
                        >
                            <AlignLeft className="size-4 text-gray-500" />
                            <span>Align left</span>
                        </button>
                        <button
                            onClick={() => { editor.chain().focus().setCellAttribute('textAlign', 'center').run(); onClose(); }}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer"
                        >
                            <AlignCenter className="size-4 text-gray-500" />
                            <span>Align center</span>
                        </button>
                        <button
                            onClick={() => { editor.chain().focus().setCellAttribute('textAlign', 'right').run(); onClose(); }}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer"
                        >
                            <AlignRight className="size-4 text-gray-500" />
                            <span>Align right</span>
                        </button>

                        <div className="h-px bg-gray-100 my-1 mx-1" />
                        
                        <div className="px-3 py-1 text-[11px] font-semibold text-gray-800 uppercase tracking-wider">
                            Vertical
                        </div>
                        <button
                            onClick={() => { setVerticalAlign('top'); onClose(); }}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer"
                        >
                            <ArrowUpToLine className="size-4 text-gray-500" />
                            <span>Align top</span>
                        </button>
                        <button
                            onClick={() => { setVerticalAlign('middle'); onClose(); }}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer"
                        >
                            <MoveHorizontal className="size-4 text-gray-500" />
                            <span>Align middle</span>
                        </button>
                        <button
                            onClick={() => { setVerticalAlign('bottom'); onClose(); }}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer"
                        >
                            <ArrowDownToLine className="size-4 text-gray-500" />
                            <span>Align bottom</span>
                        </button>
                    </div>
                </div>
            )}

            {activeSubmenu === 'color' && (
                <div 
                    style={{ transform: 'translateY(-50%)' }}
                    className="bg-white rounded-sm shadow-xl border border-gray-200 py-1.5 min-w-[170px] max-h-[350px] overflow-y-auto animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
                >
                    <div className="flex flex-col">
                        <div className="px-3 py-1 text-[11px] font-semibold text-gray-800 uppercase tracking-wider">
                            Text
                        </div>
                        {textColors.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => { setTextColor(color.value); onClose(); }}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer"
                            >
                                <div className={cn("size-4 flex items-center justify-center font-bold text-xs", color.colorClass)}>
                                    A
                                </div>
                                <span>{color.name}</span>
                            </button>
                        ))}
                        
                        <div className="h-px bg-gray-100 my-1 mx-1" />

                        <div className="px-3 py-1 text-[11px] font-semibold text-gray-800 uppercase tracking-wider">
                            Background
                        </div>
                        {bgColors.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => { setBackgroundColor(color.value); onClose(); }}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer"
                            >
                                <div className={cn("size-4 rounded border border-gray-200", color.class)} />
                                <span>{color.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>,
        document.body
    )
}
