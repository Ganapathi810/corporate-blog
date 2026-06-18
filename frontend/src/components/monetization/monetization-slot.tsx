import clsx from "clsx";
import React from "react";

type SlotType =
    | 'sidebar-top'
    | 'sidebar-bottom'
    | 'in-article'
    | 'in-article-bottom'
    | 'header'
    | 'footer'

interface MonetizationSlotProps {
    slot: SlotType;
    className?: string;
    fallback?: React.ReactNode;
}


export const MonetizationSlot = ({
    slot,
    className,
    fallback
}: MonetizationSlotProps) => {

    const provider = process.env.NEXT_PUBLIC_MONETIZATION_PROVIDER

    if (!provider) {
        return (
            <div
                className={clsx(
                    "w-full flex items-center justify-center border border-dashed border-gray-300 text-xs text-gray-700",
                    className
                )}>
                {fallback ?? `Monetization Slot: ${slot}`}
            </div>
        )
    }

    switch (provider) {
        case "adsense":
            return <div id={`adsense-${slot}`} className={className} />

        case "affiliate":
            return <div id={`affiliate-${slot}`} className={className} />
        
        default:
            return null
    }
}