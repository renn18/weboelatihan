'use client'

import {
    Calendar,
    ChevronUp,
    Home,
    Inbox,
    Search,
    Settings,
    User2,
    BarChart3,
    BookOpen,
    Users,
    LogOut,
    Menu
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Admin Menu Items
const adminItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: BarChart3,
        description: "Overview & Analytics"
    },
    {
        title: "Kelola Kursus",
        url: "/dashboard/courses",
        icon: BookOpen,
        description: "Manage all courses"
    },
    {
        title: "Kelola Pengguna",
        url: "/dashboard/users",
        icon: Users,
        description: "User management"
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
        description: "Account settings"
    },
]

// Mentor Menu Items
const mentorItems = [
    {
        title: "Dashboard",
        url: "/mentor",
        icon: Home,
        description: "Your courses"
    },
    {
        title: "Buat Kursus",
        url: "/mentor/create-course",
        icon: BookOpen,
        description: "Create new course"
    },
    {
        title: "Lihat Kursus",
        url: "/courses",
        icon: Inbox,
        description: "Browse courses"
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        description: "Account settings"
    },
]

// Student Menu Items
const studentItems = [
    {
        title: "Home",
        url: "/",
        icon: Home,
        description: "Dashboard"
    },
    {
        title: "Daftar Kelas",
        url: "/courses",
        icon: BookOpen,
        description: "Available courses"
    },
    {
        title: "Pembelajaran Saya",
        url: "/my-learning",
        icon: Inbox,
        description: "My courses"
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        description: "Account settings"
    },
]

interface AppSidebarProps {
    userRole?: string
}

export function AppSidebar({ userRole = 'user' }: AppSidebarProps) {
    const pathname = usePathname()
    const { user } = useUser()
    const { state } = useSidebar()

    // Select menu based on role
    const getMenuItems = () => {
        switch (userRole) {
            case 'admin':
                return adminItems
            case 'instructor':
                return mentorItems
            default:
                return studentItems
        }
    }

    const menuItems = getMenuItems()

    const isActive = (url: string) => {
        return pathname === url
    }

    return (
        <Sidebar className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700">

            {/* Header */}
            <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                            📚
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                                EduHub
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Learning Platform
                            </p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <SidebarContent className="px-0">
                <SidebarGroup className="px-4">
                    <SidebarGroupLabel className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">
                        {userRole === 'admin' ? '👑 Admin' : userRole === 'instructor' ? '🎓 Mentor' : '👤 Student'}
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon
                                const active = isActive(item.url)

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            className={`relative group px-4 py-3 rounded-xl transition-all duration-200 ${active
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700/50'
                                                }`}
                                        >
                                            <Link href={item.url} className="flex items-center gap-3 w-full">
                                                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:scale-110'
                                                    }`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-semibold transition-colors ${active ? 'text-white' : 'text-gray-900 dark:text-gray-200'
                                                        }`}>
                                                        {item.title}
                                                    </p>
                                                    {state === 'expanded' && (
                                                        <p className={`text-xs transition-colors line-clamp-1 ${active
                                                            ? 'text-blue-50'
                                                            : 'text-gray-600 dark:text-gray-400'
                                                            }`}>
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Quick Stats - Only show on expanded */}
                {state === 'expanded' && (
                    <SidebarGroup className="px-4 border-t border-gray-200 dark:border-gray-700">
                        <SidebarGroupLabel className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            📊 Quick Stats
                        </SidebarGroupLabel>
                        <div className="space-y-3 mt-3">
                            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Kursus Aktif</p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">5</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Progress</p>
                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">68%</p>
                            </div>
                        </div>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
                <div className="space-y-3">
                    {/* Version Info */}
                    <div className="text-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            ✨ v.1.0.0
                        </p>
                    </div>

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group">
                                {user?.imageUrl ? (
                                    <Image
                                        src={user.imageUrl}
                                        alt={user.firstName || 'User'}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-full object-cover shadow-md"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold">
                                        {user?.firstName?.charAt(0) || '?'}
                                    </div>
                                )}

                                <div className="hidden lg:block flex-1 min-w-0 text-left">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                        {user?.firstName || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                        {userRole === 'admin' ? '👑 Admin' : userRole === 'instructor' ? '🎓 Instructor' : '👤 Student'}
                                    </p>
                                </div>

                                <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors flex-shrink-0" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-2">

                            {/* User Info */}
                            <div className="px-3 py-2 mb-2">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {user?.primaryEmailAddress?.emailAddress}
                                </p>
                            </div>

                            <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-700" />

                            {/* Menu Items */}
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer transition-colors">
                                    <Settings className="w-4 h-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Link href="/user-profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer transition-colors">
                                    <User2 className="w-4 h-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-700" />

                            {/* Logout */}
                            <DropdownMenuItem asChild>
                                <button
                                    onClick={() => {
                                        // Implement logout
                                        window.location.href = '/sign-out'
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
