"use client"

import React from 'react'
import { Plus, GripVertical } from 'lucide-react'
import { Tooltip } from '../ui/tooltip'
import { cn } from '@/lib/utils'

interface BlockHandleProps {
    onAddClick: (e: React.MouseEvent) => void
}

export const BlockHandle = ({ onAddClick }: BlockHandleProps) => {
    return (
        <div className="flex items-center gap-0.5 bg-white  p-0.5 mb-1 mr-1">
            <button 
                type="button"
                className="flex items-center justify-center w-6 h-6 rounded-md text-gray-800 hover:bg-gray-200 hover:text-gray-900 transition-colors duration-100 cursor-pointer"
                onClick={onAddClick}
            >
                <Plus className="size-4" />
            </button>
            <Tooltip content="Drag to move" position="left">
                <div 
                    className="flex items-center justify-center w-6 h-6 rounded-md text-gray-800 hover:bg-gray-200 hover:text-gray-900 transition-colors duration-100 cursor-grab active:cursor-grabbing"
                    data-drag-handle
                >
                    <GripVertical className="size-4" />
                </div>
            </Tooltip>
        </div>
    )
}
