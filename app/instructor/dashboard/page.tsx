import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import InstructorStats from './InstructorStats'
import CourseManager from './CourseManager'

interface PageProps {
    searchParams?: Promise<{ filter?: string }>
}

export default async function InstructorDashboard({ searchParams }: PageProps) {
    // ✅ NEXT.JS 16: Await searchParams
    const sp = await searchParams
    const filter = sp?.filter || 'all'

    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <Link
                    href="/sign-in"
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl"
                >
                    Login untuk akses
                </Link>
            </div>
        )
    }

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        include: {
            courses: {
                include: {
                    enrollments: true,
                    sections: {
                        include: { lessons: true },
                    },
                },
            },
        },
    })

    if (!dbUser || dbUser.role !== 'instructor') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-8">
                <div className="text-center max-w-md space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Akses Terbatas</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Hanya instruktur yang bisa akses halaman ini</p>
                    <Link
                        href="/my-courses"
                        className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold"
                    >
                        Kembali
                    </Link>
                </div>
            </div>
        )
    }

    const stats = {
        totalCourses: dbUser.courses.length,
        totalStudents: dbUser.courses.reduce((acc, course) => acc + course.enrollments.length, 0),
        totalLessons: dbUser.courses.reduce((acc, course) =>
            acc + course.sections.reduce((s, section) => s + section.lessons.length, 0), 0
        ),
        activeCourses: dbUser.courses.filter(c => c.status === 'published').length,
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-2xl">👨‍🏫</span>
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-900 to-indigo-900 dark:from-purple-100 dark:to-indigo-100 bg-clip-text text-transparent">
                                    Dashboard Instruktur
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 font-medium">Kelola kursus dan buat konten</p>
                            </div>
                        </div>

                        <Link
                            href="/instructor/courses/new"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <span className="text-xl">➕</span>
                            Buat Kursus Baru
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <InstructorStats stats={stats} />

                {/* Courses Manager */}
                <CourseManager courses={dbUser.courses} />
            </div>
        </div>
    )
}
