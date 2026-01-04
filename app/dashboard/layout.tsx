import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { NavbarActions } from "@/components/navbar-actions"

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export default async function Layout({ children }: { children: React.ReactNode }) {

    const { userId: clerkUserId } = await auth()
    let userRole = 'user'

    // Get user role from database
    if (clerkUserId) {
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { role: true }
        })
        userRole = user?.role || 'user'
    }
    return (
        <SidebarProvider >
            <AppSidebar userRole={userRole} />
            <main className="flex-1 w-full">
                <NavbarActions />
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}