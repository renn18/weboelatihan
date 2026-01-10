import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SettingsClient from './SettingsClient'

export const metadata = {
    title: 'Pengaturan - Eduhub',
    description: 'Kelola profil dan preferensi Anda di dashboard Eduhub',
}

export default async function SettingsPage() {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
        redirect('/sign-in')
    }

    const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: {
            id: true,
            clerkId: true,
            email: true,
            name: true,
            role: true,
            image: true,
            createdAt: true,
            _count: {
                select: {
                    courses: true,
                    enrollments: true,
                },
            },
        },
    })

    if (!user) {
        redirect('/sign-in')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">

            {/* Header */}
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                            ⚙️ Pengaturan
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Kelola profil dan preferensi Anda
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <SettingsClient user={user} />
            </div>
        </div>
    )
}
