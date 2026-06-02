"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export const SidebarContext = createContext<{
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    open: false,
    setOpen: () => {},
})

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState(false)
    return (
        <SidebarContext.Provider value={{ open, setOpen }}>
            {children}
        </SidebarContext.Provider>
    )
}

export const useSidebar = () => useContext(SidebarContext)
