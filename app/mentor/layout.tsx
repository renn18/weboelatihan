import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function MentorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
        redirect('/sign-in')
    }

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    })

    if (!dbUser) {
        redirect('/sign-in')
    }

    return (
        <div className="min-h-screen">

            {/* Navigation */}
            <nav className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <Link href="/mentor" className="flex items-center gap-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                            <span>🎓</span>
                            <span>Mentor</span>
                        </Link>

                        {/* Menu */}
                        <div className="flex items-center gap-6">
                            <Link
                                href="/mentor"
                                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/mentor/create-course"
                                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors"
                            >
                                Buat Kursus
                            </Link>
                            <Link
                                href="/courses"
                                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors"
                            >
                                Lihat Kursus
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            {children}
        </div>
    )
}
