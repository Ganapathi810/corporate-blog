"use client";

import React, { useState, useEffect, useRef } from 'react'
import { Editor } from '@tiptap/react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Plus, GripVertical, GripHorizontal, Trash2 } from 'lucide-react'
import { Tooltip } from '../ui/tooltip'

interface TableCellHandleProps {
    editor: Editor
    onOpenMenu: (rect: DOMRect) => void
}

export const TableCellHandle = ({ editor, onOpenMenu }: TableCellHandleProps) => {
    const [rect, setRect] = useState<DOMRect | null>(null)
    const [lastCellRect, setLastCellRect] = useState<DOMRect | null>(null)
    const [tableRect, setTableRect] = useState<DOMRect | null>(null)
    const [editorRect, setEditorRect] = useState<DOMRect | null>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [isRowBarHovered, setIsRowBarHovered] = useState(false)
    const [isColBarHovered, setIsColBarHovered] = useState(false)
    const [isRowHandleHovered, setIsRowHandleHovered] = useState(false)
    const [isColHandleHovered, setIsColHandleHovered] = useState(false)
    const [isRowMenuOpen, setIsRowMenuOpen] = useState(false)
    const [isColMenuOpen, setIsColMenuOpen] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [rowBarVisible, setRowBarVisible] = useState(false)
    const [colBarVisible, setColBarVisible] = useState(false)
    const rowHideTimer = useRef<NodeJS.Timeout | null>(null)
    const colHideTimer = useRef<NodeJS.Timeout | null>(null)
    const lastHoverTableRect = useRef<DOMRect | null>(null)
    const rafUpdateId = useRef<number | null>(null)
    const rowMenuRef = useRef<HTMLDivElement>(null)
    const colMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const scheduleUpdate = (updateFn: () => void) => {
            if (rafUpdateId.current !== null) return
            rafUpdateId.current = window.requestAnimationFrame(() => {
                rafUpdateId.current = null
                updateFn()
            })
        }

        const update = () => {
            if (!editor) return

            const isTableCell = editor.isActive('table')
            
            if (!isTableCell) {
                setIsVisible(false)
                setRect(null)
                setEditorRect(null)
                setIsRowMenuOpen(false)
                setIsColMenuOpen(false)
                return
            }

            setEditorRect(editor.view.dom.getBoundingClientRect())

            // Find the selected cell element in the DOM
            const dom = editor.view.dom
            const selectedCells = Array.from(dom.querySelectorAll('.selectedCell')) as HTMLElement[]
            
            let currentRect: DOMRect | null = null
            let currentTableRect: DOMRect | null = null

            if (selectedCells.length > 0) {
                // Calculate encompassing rect for all selected cells
                let minTop = Infinity, minLeft = Infinity, maxBottom = -Infinity, maxRight = -Infinity
                
                selectedCells.forEach(cell => {
                    const r = cell.getBoundingClientRect()
                    minTop = Math.min(minTop, r.top)
                    minLeft = Math.min(minLeft, r.left)
                    maxBottom = Math.max(maxBottom, r.bottom)
                    maxRight = Math.max(maxRight, r.right)
                })

                currentRect = {
                    top: minTop,
                    left: minLeft,
                    right: maxRight,
                    bottom: maxBottom,
                    width: maxRight - minLeft,
                    height: maxBottom - minTop,
                    toJSON: () => {}
                } as DOMRect

                // For handle position, use the last selected cell
                const lastCell = selectedCells[selectedCells.length - 1]
                const lcr = lastCell.getBoundingClientRect()
                setLastCellRect(lcr)
                
                const tableElement = lastCell.closest('table')
                if (tableElement) {
                    currentTableRect = tableElement.getBoundingClientRect()
                }
            } else {
                // Fallback for single cursor position (not a drag selection)
                const { selection: stateSelection } = editor.state
                const { $from } = stateSelection
                let node = editor.view.domAtPos($from.pos).node as HTMLElement
                if (node.nodeType === 3) node = node.parentElement as HTMLElement
                const cell = node.closest('td, th') as HTMLElement
                
                if (cell) {
                    currentRect = cell.getBoundingClientRect()
                    setLastCellRect(currentRect)
                    
                    const tableElement = cell.closest('table')
                    if (tableElement) {
                        currentTableRect = tableElement.getBoundingClientRect()
                    }
                }
            }

            if (currentRect && currentTableRect) {
                setRect(currentRect)
                setTableRect(currentTableRect)

                setIsVisible(true)
            } else {
                setIsVisible(false)
                setRect(null)
                setLastCellRect(null)
                setTableRect(null)
            }
        }

        editor.on('selectionUpdate', update)
        editor.on('transaction', update)
        window.addEventListener('resize', update)
        window.addEventListener('scroll', update, true)

        const mo = new MutationObserver(() => scheduleUpdate(update))
        mo.observe(editor.view.dom, {
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'colspan', 'rowspan', 'width'],
        })

        const ro = new ResizeObserver(() => scheduleUpdate(update))
        ro.observe(editor.view.dom)

        update()

        return () => {
            if (rafUpdateId.current !== null) {
                window.cancelAnimationFrame(rafUpdateId.current)
                rafUpdateId.current = null
            }
            mo.disconnect()
            ro.disconnect()
            editor.off('selectionUpdate', update)
            editor.off('transaction', update)
            window.removeEventListener('resize', update)
            window.removeEventListener('scroll', update, true)
        }
    }, [editor])

    // Separate effect for mouse tracking to avoid re-binding editor listeners on state changes
    useEffect(() => {
        if (!editor || !isVisible) return

        const handleMouseMove = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null
            if (!target) return

            const cell = target.closest?.('td, th') as HTMLElement | null
            if (!cell) {
                if (!isRowBarHovered && rowBarVisible && !rowHideTimer.current) {
                    rowHideTimer.current = setTimeout(() => {
                        setRowBarVisible(false)
                        rowHideTimer.current = null
                    }, 2000)
                }
                if (!isColBarHovered && colBarVisible && !colHideTimer.current) {
                    colHideTimer.current = setTimeout(() => {
                        setColBarVisible(false)
                        colHideTimer.current = null
                    }, 2000)
                }
                return
            }

            const tableElement = cell.closest('table')
            if (!tableElement) return

            const tRect = tableElement.getBoundingClientRect()
            lastHoverTableRect.current = tRect

            const row = cell.closest('tr') as HTMLTableRowElement | null
            const tbodyOrThead = row?.parentElement as HTMLElement | null
            const isHoveringLastRow = !!row && !!tbodyOrThead && row === tbodyOrThead.lastElementChild

            const parentRow = cell.parentElement
            const isHoveringLastCol = !!parentRow && cell === parentRow.lastElementChild

            if (isHoveringLastRow) {
                if (rowHideTimer.current) {
                    clearTimeout(rowHideTimer.current)
                    rowHideTimer.current = null
                }
                setTableRect(tRect)
                setRowBarVisible(true)
            } else if (!isRowBarHovered && rowBarVisible && !rowHideTimer.current) {
                rowHideTimer.current = setTimeout(() => {
                    setRowBarVisible(false)
                    rowHideTimer.current = null
                }, 2000)
            }

            if (isHoveringLastCol) {
                if (colHideTimer.current) {
                    clearTimeout(colHideTimer.current)
                    colHideTimer.current = null
                }
                setTableRect(tRect)
                setColBarVisible(true)
            } else if (!isColBarHovered && colBarVisible && !colHideTimer.current) {
                colHideTimer.current = setTimeout(() => {
                    setColBarVisible(false)
                    colHideTimer.current = null
                }, 2000)
            }
        }

        const handleMouseLeaveEditor = () => {
            if (!isRowBarHovered && rowBarVisible && !rowHideTimer.current) {
                rowHideTimer.current = setTimeout(() => {
                    setRowBarVisible(false)
                    rowHideTimer.current = null
                }, 2000)
            }
            if (!isColBarHovered && colBarVisible && !colHideTimer.current) {
                colHideTimer.current = setTimeout(() => {
                    setColBarVisible(false)
                    colHideTimer.current = null
                }, 2000)
            }
        }

        editor.view.dom.addEventListener('mousemove', handleMouseMove)
        editor.view.dom.addEventListener('mouseleave', handleMouseLeaveEditor)

        return () => {
            if (rowHideTimer.current) clearTimeout(rowHideTimer.current)
            if (colHideTimer.current) clearTimeout(colHideTimer.current)
            editor.view.dom.removeEventListener('mousemove', handleMouseMove)
            editor.view.dom.removeEventListener('mouseleave', handleMouseLeaveEditor)
        }
    }, [editor, isVisible, rowBarVisible, colBarVisible, isRowBarHovered, isColBarHovered])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isRowMenuOpen && rowMenuRef.current && !rowMenuRef.current.contains(event.target as Node)) {
                setIsRowMenuOpen(false)
            }
            if (isColMenuOpen && colMenuRef.current && !colMenuRef.current.contains(event.target as Node)) {
                setIsColMenuOpen(false)
            }
        }

        if (isRowMenuOpen || isColMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isRowMenuOpen, isColMenuOpen])

    if (!isVisible || !rect || !editorRect) return null

    const originTop = editorRect.top
    const originLeft = editorRect.left

    return createPortal(
        <div
            style={{
                position: 'fixed',
                top: originTop,
                left: originLeft,
                width: editorRect.width,
                height: editorRect.height,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 60,
            }}
        >
            {/* Active Border Overlay - matches the user's requested blue border */}
            <div 
                style={{
                    position: 'absolute',
                    top: rect.top - originTop,
                    left: rect.left - originLeft,
                    width: rect.width,
                    height: rect.height,
                    border: '1.5px solid #3B82F6',
                    background: 'rgba(59, 130, 246, 0.03)',
                    pointerEvents: 'none',
                    zIndex: 50,
                    borderRadius: '1px',
                }}
            />

            {/* Row Highlight Overlay */}
            {isRowMenuOpen && tableRect && (
                <div 
                    className="animate-in fade-in duration-200"
                    style={{
                        position: 'absolute',
                        top: rect.top - originTop,
                        left: tableRect.left - originLeft,
                        width: tableRect.width,
                        height: rect.height,
                        background: 'rgba(59, 130, 246, 0.12)',
                        borderTop: '1px solid rgba(59, 130, 246, 0.3)',
                        borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
                        pointerEvents: 'none',
                        zIndex: 40,
                    }}
                />
            )}

            {/* Column Highlight Overlay */}
            {isColMenuOpen && tableRect && (
                <div 
                    className="animate-in fade-in duration-200"
                    style={{
                        position: 'absolute',
                        top: tableRect.top - originTop,
                        left: rect.left - originLeft,
                        width: rect.width,
                        height: tableRect.height,
                        background: 'rgba(59, 130, 246, 0.12)',
                        borderLeft: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRight: '1px solid rgba(59, 130, 246, 0.3)',
                        pointerEvents: 'none',
                        zIndex: 40,
                    }}
                />
            )}

            <button 
                style={{
                    position: 'absolute',
                    top: (lastCellRect ? lastCellRect.top + lastCellRect.height / 2 : rect.top + rect.height / 2) - originTop,
                    left: (lastCellRect ? lastCellRect.right : rect.right) - originLeft,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 60,
                    pointerEvents: 'auto',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onOpenMenu(rect)
                }}
                className={cn(
                    "rounded-full border-2 border-white shadow-md cursor-pointer flex items-center justify-center p-0 outline-none transition-[width,height,background-color] duration-150 animate-in fade-in zoom-in-95 duration-200",
                    isHovered ? "size-6" : "size-[14px]",
                    "bg-[#1D4ED8] hover:bg-[#1E40AF]"
                )}
            >
                <Tooltip content="Cell properties" position="top">
                    <div className="size-full flex items-center justify-center">
                        {isHovered && (
                            <div className="grid grid-cols-2 gap-0.5 pointer-events-none animate-in fade-in zoom-in duration-150">
                                <div className="size-[3.5px] bg-white rounded-full opacity-100 shadow-sm" />
                                <div className="size-[3.5px] bg-white rounded-full opacity-100 shadow-sm" />
                                <div className="size-[3.5px] bg-white rounded-full opacity-100 shadow-sm" />
                                <div className="size-[3.5px] bg-white rounded-full opacity-100 shadow-sm" />
                            </div>
                        )}
                    </div>
                </Tooltip>
            </button>

            {/* Row Addition Bar at Table Bottom */}
            <div 
                style={{
                    position: 'absolute',
                    top: (tableRect ? tableRect.bottom + 4 : rect.bottom + 4) - originTop,
                    left: (tableRect ? tableRect.left : rect.left) - originLeft,
                    width: tableRect ? tableRect.width : rect.width,
                    height: '24px',
                    zIndex: 45,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // Prevent the invisible wrapper from "hovering itself" and keeping the bar alive.
                    pointerEvents: (rowBarVisible || isRowBarHovered) ? 'auto' : 'none',
                }}
                onMouseEnter={() => {
                    setIsRowBarHovered(true)
                    if (rowHideTimer.current) {
                        clearTimeout(rowHideTimer.current)
                        rowHideTimer.current = null
                    }
                }}
                onMouseLeave={() => {
                    setIsRowBarHovered(false)
                    if (rowBarVisible && !rowHideTimer.current) {
                        rowHideTimer.current = setTimeout(() => {
                            setRowBarVisible(false)
                            rowHideTimer.current = null
                        }, 2000)
                    }
                }}
            >
                <button
                    onClick={() => {
                        editor.chain().focus().addRowAfter().run()
                    }}
                    className={cn(
                        "w-[95%] h-3 bg-gray-100/80 rounded-full transition-all duration-300 relative flex items-center justify-center border border-gray-200 shadow-sm cursor-pointer",
                        (rowBarVisible || isRowBarHovered) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
                    )}
                >
                    <Plus className="size-4 text-gray-500 hover:text-gray-800 transition-colors" />
                </button>
            </div>

            {/* Column Addition Bar at Table Right */}
            <div 
                style={{
                    position: 'absolute',
                    top: (tableRect ? tableRect.top : rect.top) - originTop,
                    left: (tableRect ? tableRect.right + 4 : rect.right + 4) - originLeft,
                    width: '24px',
                    height: tableRect ? tableRect.height : rect.height,
                    zIndex: 45,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // Same idea as the row bar: when hidden, don't capture hover events.
                    pointerEvents: (colBarVisible || isColBarHovered) ? 'auto' : 'none',
                }}
                onMouseEnter={() => {
                    setIsColBarHovered(true)
                    if (colHideTimer.current) {
                        clearTimeout(colHideTimer.current)
                        colHideTimer.current = null
                    }
                }}
                onMouseLeave={() => {
                    setIsColBarHovered(false)
                    if (colBarVisible && !colHideTimer.current) {
                        colHideTimer.current = setTimeout(() => {
                            setColBarVisible(false)
                            colHideTimer.current = null
                        }, 2000)
                    }
                }}
            >
                <button
                    onClick={() => {
                        editor.chain().focus().addColumnAfter().run()
                    }}
                    className={cn(
                        "h-[95%] w-3 bg-gray-100/80 rounded-full transition-all duration-300 relative flex items-center justify-center border border-gray-200 shadow-sm cursor-pointer",
                        (colBarVisible || isColBarHovered) ? "opacity-100 translate-x-0" : "opacity-0 translate-x-1 pointer-events-none"
                    )}
                >
                    <Plus className="size-4 text-gray-500 hover:text-gray-800 transition-colors" />
                </button>
            </div>

            {/* Row Selector Handle (Left of Table) */}
            <div 
                ref={rowMenuRef}
                style={{
                    position: 'absolute',
                    top: rect.top + rect.height / 2 - originTop,
                    left: (tableRect ? tableRect.left - 24 : rect.left - 24) - originLeft,
                    transform: 'translateY(-50%)',
                    zIndex: 60,
                    pointerEvents: 'auto',
                }}
                onMouseEnter={() => setIsRowHandleHovered(true)}
                onMouseLeave={() => {
                    setIsRowHandleHovered(false)
                    if (!isRowMenuOpen) setIsRowMenuOpen(false)
                }}
            >
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsRowMenuOpen(!isRowMenuOpen)
                        setIsColMenuOpen(false)
                    }}
                    className={cn(
                        "size-5 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-gray-50 hover:border-gray-300",
                        "opacity-100 scale-100"
                    )}
                >
                    <GripVertical className="size-3.5 text-gray-400 group-hover:text-gray-600" />
                </button>

                {isRowMenuOpen && (
                    <div className="absolute left-full ml-2 top-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px] animate-in fade-in zoom-in-95 duration-100 z-70">
                        <button
                            onClick={() => {
                                editor.chain().focus().deleteRow().run()
                                setIsRowMenuOpen(false)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600 text-sm transition-colors"
                        >
                            <Trash2 className="size-3.5" />
                            <span>Delete row</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Column Selector Handle (Top of Table) */}
            <div 
                ref={colMenuRef}
                style={{
                    position: 'absolute',
                    top: (tableRect ? tableRect.top - 24 : rect.top - 24) - originTop,
                    left: rect.left + rect.width / 2 - originLeft,
                    transform: 'translateX(-50%)',
                    zIndex: 60,
                    pointerEvents: 'auto',
                }}
                onMouseEnter={() => setIsColHandleHovered(true)}
                onMouseLeave={() => {
                    setIsColHandleHovered(false)
                    if (!isColMenuOpen) setIsColMenuOpen(false)
                }}
            >
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsColMenuOpen(!isColMenuOpen)
                        setIsRowMenuOpen(false)
                    }}
                    className={cn(
                        "size-5 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-gray-50 hover:border-gray-300",
                        "opacity-100 scale-100"
                    )}
                >
                    <GripHorizontal className="size-3.5 text-gray-400 group-hover:text-gray-600" />
                </button>

                {isColMenuOpen && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-100 z-70">
                        <button
                            onClick={() => {
                                editor.chain().focus().deleteColumn().run()
                                setIsColMenuOpen(false)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600 text-sm transition-colors"
                        >
                            <Trash2 className="size-3.5" />
                            <span>Delete column</span>
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
