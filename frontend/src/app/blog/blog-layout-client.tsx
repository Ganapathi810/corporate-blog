"use client"

import { authClient } from "@/lib/auth-client";
import { SidebarProvider } from "@/components/dashboard/sidebar-provider";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProtectedTopbar } from "@/components/top-bar/private-top-bar";

export const BlogLayoutClient = ({ 
    children, 
    publicTopbar 
}: { 
    children: React.ReactNode, 
    publicTopbar: React.ReactNode 
}) => {
    const { data: session, isPending } = authClient.useSession();

    // While checking session or if not logged in, show the public layout.
    // This ensures fast initial load and no layout shifts for regular readers.
    if (!session || isPending) {
        return (
            <div className="flex flex-col min-h-screen">
                {publicTopbar}
                <main className="flex-grow px-4 py-16 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        )
    }

    // Show the authenticated dashboard layout with sidebar
    return (
        <SidebarProvider>
            <div className="flex bg-slate-50 min-h-screen w-full">
                <Sidebar />
                <div className="grow min-w-0">
                    <ProtectedTopbar />
                    <main className="px-6 py-8 max-w-7xl mx-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
