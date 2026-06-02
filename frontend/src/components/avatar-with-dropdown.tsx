"use client"

import { useSession } from "@/lib/auth-client"
import { useEffect, useRef, useState } from "react"
import { AvatarDropdown } from "./avatar-dropdown"
import Image from "next/image"

export const AvatarWithDropdown = () => {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (!wrapperRef.current) return
      if (wrapperRef.current.contains(event.target as Node)) return

      setOpen(false)
    }

    window.addEventListener("mousedown", handleMouseDown)
    return () => window.removeEventListener("mousedown", handleMouseDown)
  }, [])

  if (!mounted || !session?.user) return null

  const { name, image } = session.user

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer relative overflow-hidden rounded-full size-10 border border-blue-200 flex items-center justify-center bg-slate-50 hover:ring-4 hover:ring-blue-100 transition-all duration-150"
      >
        {image ? (
            <Image 
                src={image}
                alt={name}
                fill
                className="object-cover"
            />
        ) : (
            <span className="text-blue-600 font-bold">
                {name?.toUpperCase().charAt(0)}
            </span>
        )}
      </button>
      {open && <AvatarDropdown setOpen={setOpen} />}
    </div>
  )
}