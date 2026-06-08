import { getServerSession } from "@/lib/auth-server";
import { PublicTopbar } from "@/components/top-bar/public-top-bar";
import { SidebarProvider } from "@/components/dashboard/sidebar-provider";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProtectedTopbar } from "@/components/top-bar/private-top-bar";

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = await getServerSession();

    if (session) {
        return (
            <SidebarProvider>
                <div className="flex bg-slate-50 min-h-screen">
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

    return (
        <div className="flex flex-col min-h-screen">
            <PublicTopbar />
            <main className="flex-grow px-4 py-16 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    )
}
