import { Sidebar } from "@/components/dashboard/sidebar";
import { ProtectedTopbar } from "@/components/top-bar/private-top-bar";
import { SidebarProvider } from "@/components/dashboard/sidebar-provider";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex">
                <Sidebar />
                <div className="grow min-w-0">
                    <ProtectedTopbar />
                    <main className="px-9 py-1 max-w-7xl mx-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}