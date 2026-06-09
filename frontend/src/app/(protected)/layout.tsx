import { Sidebar } from "@/components/dashboard/sidebar";
import { ProtectedTopbar } from "@/components/top-bar/private-top-bar";
import { SidebarProvider } from "@/components/dashboard/sidebar-provider";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const result = await getServerSession();
    const { data: session } = result
    console.log("auth client response::", JSON.stringify(result, null, 2));

    if (!session) {
        console.log("session does not exists... redirect")
        redirect("/login")
    } else {
        console.log("session exists...")
        console.log(session)
    }

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