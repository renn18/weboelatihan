import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import CourseCard from './CourseCard'

interface PageProps {
    searchParams?: Promise<{ sort?: string }>
}

export default async function MyCourses({ searchParams }: PageProps) {
    const sp = await searchParams
    const sort = sp?.sort || 'newest'

    const { userId: clerkUserId } = await auth()
    console.log('🔑 Clerk User ID:', clerkUserId)

    if (!clerkUserId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
                <div className="text-center">
                    <Link
                        href="/sign-in"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-xl"
                    >
                        🔐 Login untuk Melanjutkan
                    </Link>
                </div>
            </div>
        )
    }

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    })

    if (!dbUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-8">
                <div className="text-center max-w-md space-y-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-400 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Tidak Ditemukan</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Akun Anda belum terdaftar di sistem</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/sign-out"
                            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            Logout
                        </Link>
                        <Link
                            href="/"
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            Beranda
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // ✅ FETCH dengan progress included
    const enrollments = await prisma.enrollment.findMany({
        where: {
            userId: dbUser.id,
            status: 'active',
        },
        include: {
            course: {
                include: {
                    user: { select: { name: true, image: true } },
                    sections: {
                        include: { lessons: true },
                    },
                },
            },
            // ✅ PENTING: Include progress untuk hitung completed
            progress: {
                where: { isCompleted: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    // ✅ Transform dengan hitung progress
    const enrolledCourses = enrollments.map(enrollment => {
        // Total lessons dari semua sections
        const totalLessons = enrollment.course.sections.reduce(
            (acc: number, section: any) => acc + section.lessons.length,
            0
        )

        // Completed lessons dari progress
        const completedLessons = enrollment.progress.length

        // Hitung persentase
        const progressPercent = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0

        return {
            id: enrollment.id,
            course: enrollment.course,
            enrolledAt: enrollment.createdAt,
            totalLessons,
            completedLessons,
            progress: progressPercent,
        }
    })

    console.log('📚 Total enrolled courses:', enrolledCourses.length)
    console.log('📊 Progress data:', enrolledCourses.map(c => ({
        course: c.course.title,
        progress: `${c.completedLessons}/${c.totalLessons} (${c.progress}%)`
    })))

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex w-28 h-28 bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl ring-4 ring-emerald-200/50 dark:ring-emerald-900/50 hover:scale-110 transition-transform duration-500">
                        <span className="text-4xl drop-shadow-lg">📚</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-gray-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-6 leading-tight drop-shadow-lg">
                        Kursus Saya
                    </h1>

                    <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium">
                        Pantau progress belajar dan lanjutkan kursus Anda dengan nyaman
                    </p>
                </div>

                {/* Stats Cards */}
                {enrolledCourses.length > 0 && (
                    <div className="grid md:grid-cols-4 gap-6 mb-20 max-w-5xl mx-auto">
                        <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-white/70 dark:border-gray-700/70 hover:border-emerald-200/70 dark:hover:border-emerald-800/50 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="text-4xl mb-4 drop-shadow-lg">🎯</div>
                                <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                                    {enrolledCourses.length}
                                </div>
                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">Kursus Aktif</div>
                            </div>
                        </div>

                        <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-white/70 dark:border-gray-700/70 hover:border-blue-200/70 dark:hover:border-blue-800/50 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="text-4xl mb-4 drop-shadow-lg">✅</div>
                                <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                                    {enrolledCourses.filter(c => c.progress === 100).length}
                                </div>
                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">Terselesaikan</div>
                            </div>
                        </div>

                        <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-white/70 dark:border-gray-700/70 hover:border-purple-200/70 dark:hover:border-purple-800/50 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="text-4xl mb-4 drop-shadow-lg">🏆</div>
                                <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                                    0
                                </div>
                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">Sertifikat</div>
                            </div>
                        </div>

                        <Link
                            href="/courses"
                            className="group bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 dark:from-emerald-600 dark:to-teal-700 dark:hover:from-emerald-700 dark:hover:to-teal-800 p-8 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-3 transition-all duration-500 text-white flex flex-col items-center justify-center ring-4 ring-emerald-200/50 hover:ring-emerald-300/70 dark:ring-emerald-900/50 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                            <div className="relative z-10 text-center space-y-2">
                                <div className="text-4xl group-hover:scale-125 transition-transform duration-300 drop-shadow-lg">➕</div>
                                <div className="text-xl font-bold drop-shadow">Kursus Baru</div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Courses Section */}
                <div className="space-y-12">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-4">
                        <span className="text-3xl drop-shadow-lg">🎯</span>
                        Kursus Aktif ({enrolledCourses.length})
                    </h2>

                    {enrolledCourses.length === 0 ? (
                        <div className="text-center py-32 px-8">
                            <div className="w-48 h-48 mx-auto mb-12 bg-gradient-to-br from-gray-100/50 to-gray-200/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-gray-200/50 dark:ring-gray-700/50 backdrop-blur-xl animate-bounce">
                                <span className="text-6xl drop-shadow-lg">📚</span>
                            </div>

                            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 drop-shadow-lg">
                                Belum ada kursus aktif
                            </h3>

                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-lg mx-auto leading-relaxed font-medium">
                                Daftar ke kursus favorit Anda dan mulailah perjalanan belajar yang luar biasa
                            </p>

                            <Link
                                href="/courses"
                                className="inline-flex items-center gap-4 px-12 py-6 md:px-16 md:py-7 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 dark:from-emerald-600 dark:to-teal-700 dark:hover:from-emerald-700 dark:hover:to-teal-800 text-white font-bold text-xl md:text-2xl rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 ring-4 ring-emerald-200/50 hover:ring-emerald-300/70 dark:ring-emerald-900/50 backdrop-blur-xl hover:scale-105 group"
                            >
                                <span className="text-2xl group-hover:scale-125 transition-transform duration-300">🚀</span>
                                Jelajahi Kursus Sekarang
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                            {enrolledCourses.map((courseData: any) => (
                                <CourseCard key={courseData.id} courseData={courseData} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
