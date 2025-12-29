import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { NavbarActions } from "@/components/navbar-actions"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider >
            <AppSidebar />
            <main className="flex-1 w-full">
                <NavbarActions />
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}