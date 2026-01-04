import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import MentorDashboardClient from './MentorDashboardClient'

export default async function MentorPage() {
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

    // Fetch mentor courses
    const courses = await prisma.course.findMany({
        where: { userId: dbUser.id },
        include: {
            sections: {
                include: {
                    lessons: true,
                },
            },
            enrollments: {
                include: {
                    user: true,
                    progress: true,
                },
            },
            _count: {
                select: {
                    enrollments: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    // Calculate statistics
    const stats = {
        totalCourses: courses.length,
        totalEnrollments: courses.reduce((acc, c) => acc + c.enrollments.length, 0),
        totalStudents: new Set(
            courses.flatMap(c => c.enrollments.map(e => e.userId))
        ).size,
        publishedCourses: courses.filter(c => c.isPublished).length,
    }

    // Calculate course statistics
    const coursesWithStats = courses.map(course => {
        const totalLessons = course.sections.reduce(
            (acc, section) => acc + section.lessons.length,
            0
        )

        const totalEnrollments = course.enrollments.length
        const completedEnrollments = course.enrollments.filter(
            e => e.status === 'completed'
        ).length

        const totalProgress = course.enrollments.reduce((acc, enrollment) => {
            const completedLessons = enrollment.progress.length
            return acc + (totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0)
        }, 0)

        const avgProgress =
            totalEnrollments > 0 ? Math.round(totalProgress / totalEnrollments) : 0

        return {
            ...course,
            totalLessons,
            totalEnrollments,
            completedEnrollments,
            avgProgress,
        }
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">

            {/* Header */}
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                            🎓 Panel Mentor
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Kelola kursus dan pantau siswa Anda
                        </p>
                    </div>
                    <Link
                        href="/mentor/create-course"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        <span>➕</span>
                        Buat Kursus Baru
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

                    {/* Total Courses */}
                    <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all border border-gray-200/50 dark:border-gray-700/50 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="text-5xl mb-4">📚</div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Kursus</p>
                            <p className="text-4xl font-black text-blue-600 dark:text-blue-400">
                                {stats.totalCourses}
                            </p>
                        </div>
                    </div>

                    {/* Published Courses */}
                    <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all border border-gray-200/50 dark:border-gray-700/50 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="text-5xl mb-4">✅</div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Dipublikasikan</p>
                            <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                                {stats.publishedCourses}
                            </p>
                        </div>
                    </div>

                    {/* Total Enrollments */}
                    <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all border border-gray-200/50 dark:border-gray-700/50 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="text-5xl mb-4">👥</div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Pendaftar</p>
                            <p className="text-4xl font-black text-purple-600 dark:text-purple-400">
                                {stats.totalEnrollments}
                            </p>
                        </div>
                    </div>

                    {/* Unique Students */}
                    <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all border border-gray-200/50 dark:border-gray-700/50 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="text-5xl mb-4">🎯</div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Siswa Unik</p>
                            <p className="text-4xl font-black text-orange-600 dark:text-orange-400">
                                {stats.totalStudents}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Courses Section */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            📖 Kursus Saya
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Kelola dan pantau semua kursus yang Anda buat
                        </p>
                    </div>

                    {coursesWithStats.length === 0 ? (
                        <div className="text-center py-24 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
                            <div className="text-6xl mb-6">📚</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Belum ada kursus
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                Mulai membuat kursus pertama Anda dan bantu siswa belajar
                            </p>
                            <Link
                                href="/mentor/create-course"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                <span>➕</span>
                                Buat Kursus Pertama
                            </Link>
                        </div>
                    ) : (
                        <MentorDashboardClient courses={coursesWithStats} />
                    )}
                </div>
            </div>
        </div>
    )
}
