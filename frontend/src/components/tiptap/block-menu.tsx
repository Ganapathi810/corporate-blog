"use client"

import React from 'react'
import { 
    Heading1, 
    Heading2, 
    Heading3, 
    Heading4,
    Heading5,
    Text, 
    List, 
    ListOrdered 
} from 'lucide-react'

interface BlockMenuProps {
    onSelect: (type: string, attrs?: any) => void
    onClose: () => void
    position: { top: number; left: number }
}

export const BlockMenu = ({ onSelect, onClose, position }: BlockMenuProps) => {
    const items = [
        { label: 'Text', type: 'paragraph', icon: Text },
        { label: 'Heading 1', type: 'heading', attrs: { level: 1 }, icon: Heading1 },
        { label: 'Heading 2', type: 'heading', attrs: { level: 2 }, icon: Heading2 },
        { label: 'Heading 3', type: 'heading', attrs: { level: 3 }, icon: Heading3 },
        { label: 'Heading 4', type: 'heading', attrs: { level: 4 }, icon: Heading4 },
        { label: 'Heading 5', type: 'heading', attrs: { level: 5 }, icon: Heading5 },
        { label: 'Bullet List', type: 'bulletList', icon: List },
        { label: 'Numbered List', type: 'orderedList', icon: ListOrdered },
    ]

    return (
        <>
            <div 
                className="fixed inset-0 z-40" 
                onClick={onClose}
            />
            <div 
                className="fixed z-50 bg-white border border-gray-200 rounded-sm shadow-2xl p-1.5 w-64 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5"
                style={{ top: position.top, left: position.left }}
            >
                <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Basic Blocks
                </div>
                {items.map((item) => (
                    <button
                        key={item.label}
                        className="w-full flex items-center gap-3 px-2 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-sm transition-colors text-left group cursor-pointer"
                        onClick={() => {
                            onSelect(item.type, item.attrs)
                            onClose()
                        }}
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded border border-gray-100 bg-white shadow-sm group-hover:border-blue-200">
                            <item.icon className="size-4 text-gray-500 group-hover:text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium">{item.label}</span>
                            <span className="text-[10px] text-gray-400 group-hover:text-blue-400/80">Add a simple text block</span>
                        </div>
                    </button>
                ))}
            </div>
        </>
    )
}
