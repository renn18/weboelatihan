import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SectionsClient from './SectionsClient'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function CourseSectionsPage({ params }: PageProps) {
    const { id: courseId } = await params
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <Link
                    href="/sign-in"
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg"
                >
                    Login terlebih dahulu
                </Link>
            </div>
        )
    }

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    })

    if (!dbUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        User tidak ditemukan
                    </h2>
                    <Link href="/sign-out" className="text-blue-600 hover:underline">
                        Logout dan coba lagi
                    </Link>
                </div>
            </div>
        )
    }

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            sections: {
                orderBy: { order: 'asc' },
                include: {
                    lessons: {
                        orderBy: { order: 'asc' },
                    },
                },
            },
        },
    })

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Kursus tidak ditemukan
                    </h2>
                    <Link
                        href="/instructor/dashboard"
                        className="text-blue-600 hover:underline font-semibold"
                    >
                        Kembali ke dashboard
                    </Link>
                </div>
            </div>
        )
    }

    if (course.userId !== dbUser.id) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Anda tidak memiliki akses ke kursus ini
                    </h2>
                    <Link
                        href="/instructor/dashboard"
                        className="text-blue-600 hover:underline font-semibold"
                    >
                        Kembali ke dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header - STATIC, NO HANDLERS */}
                <div className="mb-12">
                    <Link
                        href="/instructor/dashboard"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-6 transition-colors"
                    >
                        ← Kembali ke Dashboard
                    </Link>

                    <h1 className="text-5xl font-black bg-gradient-to-r from-purple-900 to-indigo-900 dark:from-purple-100 dark:to-indigo-100 bg-clip-text text-transparent mb-4">
                        Kelola Bagian & Pelajaran
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Kursus: <span className="font-bold text-gray-900 dark:text-white">{course.title}</span>
                    </p>
                </div>

                {/* ✅ CLIENT COMPONENT - SEMUA HANDLER DI SINI */}
                <SectionsClient course={course} />
            </div>
        </div>
    )
}
