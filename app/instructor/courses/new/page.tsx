import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import CreateCourseClient from './CreateCourseClient'

interface PageProps {
    searchParams?: Promise<{ courseId?: string }>
}

export default async function CreateCoursePage({ searchParams }: PageProps) {
    const sp = await searchParams
    const courseId = sp?.courseId

    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <Link href="/sign-in" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl">
                    Login terlebih dahulu
                </Link>
            </div>
        )
    }

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    })

    if (!dbUser || dbUser.role !== 'instructor') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-8">
                <div className="text-center max-w-md">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Akses Terbatas
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                        Hanya instruktur yang bisa membuat kursus
                    </p>
                    <Link
                        href="/instructor/dashboard"
                        className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl"
                    >
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    // Jika edit: fetch course data
    let course = null
    if (courseId) {
        course = await prisma.course.findUnique({
            where: { id: courseId },
        })

        if (!course || course.userId !== dbUser.id) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-8">
                    <div className="text-center max-w-md">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Kursus Tidak Ditemukan
                        </h2>
                        <Link
                            href="/instructor/dashboard"
                            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl"
                        >
                            Kembali ke Dashboard
                        </Link>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-12">
                    <Link
                        href="/instructor/dashboard"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-6"
                    >
                        ← Kembali ke Dashboard
                    </Link>

                    <h1 className="text-5xl font-black bg-gradient-to-r from-purple-900 to-indigo-900 dark:from-purple-100 dark:to-indigo-100 bg-clip-text text-transparent mb-4">
                        {course ? '✏️ Edit Kursus' : '➕ Buat Kursus Baru'}
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        {course
                            ? 'Perbarui informasi kursus Anda'
                            : 'Mulai membuat kursus berkualitas untuk siswa Anda'
                        }
                    </p>
                </div>

                {/* Form */}
                <CreateCourseClient course={course} userId={dbUser.id} />
            </div>
        </div>
    )
}
