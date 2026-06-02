"use client"

import React from "react"
import clsx from "clsx"

interface TooltipProps {
    content: string
    children: React.ReactNode
    position?: "top" | "bottom" | "left" | "right"
    className?: string
}

export const Tooltip = ({ content, children, position = "top", className }: TooltipProps) => {
    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2 origin-top",
        left: "right-full top-1/2 -translate-y-1/2 mr-2 origin-right",
        right: "left-full top-1/2 -translate-y-1/2 ml-2 origin-left",
    }

    const animationClasses = {
        top: "translate-y-1 group-hover:translate-y-0",
        bottom: "-translate-y-1 group-hover:translate-y-0",
        left: "translate-x-1 group-hover:translate-x-0",
        right: "-translate-x-1 group-hover:translate-x-0",
    }

    return (
        <div className={clsx("group/tooltip relative inline-flex", className)}>
            {children}
            <div
                className={clsx(
                    "absolute whitespace-nowrap z-[100] px-2.5 py-1.5 rounded-md",
                    "bg-slate-900/95 backdrop-blur-sm text-white text-[11px] font-semibold border border-slate-700/50 shadow-xl",
                    "opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100",
                    "transition-all duration-200 pointer-events-none",
                    positionClasses[position],
                    animationClasses[position]
                )}
            >
                {content}
                {/* Optional: Add a small arrow here if needed, but the clean sidebar look is usually arrowless */}
            </div>
        </div>
    )
}
