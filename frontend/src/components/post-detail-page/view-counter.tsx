"use client"
import * as Sentry from "@sentry/nextjs";

import { useEffect, useRef } from "react"

interface ViewCounterProps {
    slug: string;
}

export const ViewCounter = ({ slug }: ViewCounterProps) => {
    const hasIncremented = useRef(false)

    useEffect(() => {
        if (hasIncremented.current) return
        
        const timer = setTimeout(async () => {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${slug}/view`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                hasIncremented.current = true
            } catch (error) {
                Sentry.captureException(error)
            }
        }, 5000) // Track view after 5 seconds of stay

        return () => clearTimeout(timer)
    }, [slug])

    return null // Invisible component
}
