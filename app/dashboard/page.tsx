import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    Users,
    BookOpen,
    TrendingUp,
    BarChart3,
    Activity,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight
} from 'lucide-react'
import Image from 'next/image'
import MethodNotAllowedPage from '@/components/MethodNotAllowed'

export const metadata = {
    title: 'Dashboard - Eduhub',
    description: 'Kelola pengguna, kursus, dan aktivitas pembelajaran di platform Eduhub',
}

export default async function AdminDashboard() {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
        redirect('/sign-in')
    }

    const admin = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    })

    // if (!admin || admin.role !== 'admin') {
    //     return <MethodNotAllowedPage />
    // }

    // Fetch comprehensive statistics
    const totalUsers = await prisma.user.count()
    const instructors = await prisma.user.count({ where: { role: 'instructor' } })
    const students = await prisma.user.count({ where: { role: 'user' } })

    const totalCourses = await prisma.course.count()
    const publishedCourses = await prisma.course.count({ where: { isPublished: true } })
    const draftCourses = await prisma.course.count({ where: { isPublished: false } })

    const totalEnrollments = await prisma.enrollment.count()
    const completedEnrollments = await prisma.enrollment.count({ where: { status: 'completed' } })
    const activeEnrollments = await prisma.enrollment.count({ where: { status: 'active' } })

    // Recent activity
    const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            createdAt: true,
        }
    })

    const recentCourses = await prisma.course.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            title: true,
            slug: true,
            isPublished: true,
            createdAt: true,
            user: {
                select: { name: true }
            },
            _count: {
                select: { enrollments: true }
            }
        }
    })

    // Growth metrics
    const usersThisMonth = await prisma.user.count({
        where: {
            createdAt: {
                gte: new Date(new Date().setDate(1))
            }
        }
    })

    const enrollmentsThisMonth = await prisma.enrollment.count({
        where: {
            createdAt: {
                gte: new Date(new Date().setDate(1))
            }
        }
    })

    const coursesThisMonth = await prisma.course.count({
        where: {
            createdAt: {
                gte: new Date(new Date().setDate(1))
            }
        }
    })

    const stats = [
        {
            title: 'Total Pengguna',
            value: totalUsers,
            change: usersThisMonth,
            changePercent: '+12.5%',
            icon: Users,
            color: 'from-blue-500 to-indigo-600',
            bgColor: 'from-blue-50 to-blue-100',
            darkBgColor: 'from-blue-900/20 to-blue-800/20',
            textColor: 'text-blue-600 dark:text-blue-400'
        },
        {
            title: 'Total Kursus',
            value: totalCourses,
            change: coursesThisMonth,
            changePercent: '+8.2%',
            icon: BookOpen,
            color: 'from-emerald-500 to-teal-600',
            bgColor: 'from-emerald-50 to-emerald-100',
            darkBgColor: 'from-emerald-900/20 to-emerald-800/20',
            textColor: 'text-emerald-600 dark:text-emerald-400'
        },
        {
            title: 'Total Pendaftar',
            value: totalEnrollments,
            change: enrollmentsThisMonth,
            changePercent: '+24.3%',
            icon: BarChart3,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'from-purple-50 to-purple-100',
            darkBgColor: 'from-purple-900/20 to-purple-800/20',
            textColor: 'text-purple-600 dark:text-purple-400'
        },
        {
            title: 'Selesai',
            value: completedEnrollments,
            change: Math.round(totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0),
            changePercent: '68%',
            icon: CheckCircle2,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-orange-100',
            darkBgColor: 'from-orange-900/20 to-orange-800/20',
            textColor: 'text-orange-600 dark:text-orange-400'
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">

            {/* Header */}
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white">
                                👑 Admin Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Selamat datang, {admin.name || 'Admin'}
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50">
                            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                            <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                                Platform aktif
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={index}
                                className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-200/50 dark:border-gray-700/50 overflow-hidden relative"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                <div className="relative z-10 space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                {stat.title}
                                            </p>
                                            <p className={`text-3xl font-black mt-2 ${stat.textColor}`}>
                                                {stat.value.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                    </div>

                                    {/* Change */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                            <ArrowUpRight className="w-4 h-4" />
                                            <span className="text-sm font-bold">
                                                {stat.changePercent}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            bulan ini
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

                    {/* Users Breakdown */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Breakdown Pengguna
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                        👤 Students
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Pelajar aktif
                                    </p>
                                </div>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {students}
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                        🎓 Instructors
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Pembuat kursus
                                    </p>
                                </div>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {instructors}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Courses Breakdown */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            Status Kursus
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                        ✅ Dipublikasikan
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Ready for students
                                    </p>
                                </div>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {publishedCourses}
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                        📝 Draft
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Dalam pengerjaan
                                    </p>
                                </div>
                                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {draftCourses}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Enrollments Breakdown */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                            Status Enrollment
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                        ▶️ Active
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Sedang belajar
                                    </p>
                                </div>
                                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                                    {activeEnrollments}
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                        ✓ Completed
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Selesai belajar
                                    </p>
                                </div>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {completedEnrollments}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">

                    {/* Recent Users */}
                    <div className="lg:col-span-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                👥 Pengguna Terbaru
                            </h3>
                            <Link
                                href="/admin/users"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                            >
                                Lihat semua →
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {recentUsers.map(user => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        {user.image ? (
                                            <Image
                                                width={40}
                                                height={40}
                                                src={user.image}
                                                alt={user.name || 'User'}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                                {user.name?.charAt(0) || '?'}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {user.name || 'No Name'}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${user.role === 'admin'
                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                        : user.role === 'instructor'
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {user.role === 'admin' ? '👑 Admin' : user.role === 'instructor' ? '🎓 Instructor' : '👤 Student'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            ⚡ Aksi Cepat
                        </h3>

                        <div className="space-y-3">
                            <Link
                                href="/admin/users"
                                className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors border border-blue-200 dark:border-blue-800/50"
                            >
                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
                                        Kelola Pengguna
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Atur role pengguna
                                    </p>
                                </div>
                                <span className="text-lg">→</span>
                            </Link>

                            <Link
                                href="/admin/courses"
                                className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800/50"
                            >
                                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                                        Kelola Kursus
                                    </p>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                        Lihat semua kursus
                                    </p>
                                </div>
                                <span className="text-lg">→</span>
                            </Link>

                            <Link
                                href="/settings"
                                className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors border border-purple-200 dark:border-purple-800/50"
                            >
                                <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-purple-900 dark:text-purple-200">
                                        Admin Settings
                                    </p>
                                    <p className="text-xs text-purple-700 dark:text-purple-300">
                                        Konfigurasi sistem
                                    </p>
                                </div>
                                <span className="text-lg">→</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Courses */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            📚 Kursus Terbaru
                        </h3>
                        <Link
                            href="/admin/courses"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                        >
                            Lihat semua →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Judul Kursus
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Instructor
                                    </th>
                                    <th className="text-center px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Siswa
                                    </th>
                                    <th className="text-center px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentCourses.map(course => (
                                    <tr
                                        key={course.id}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/courses/${course.slug}`}
                                                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                {course.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {course.user?.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900 dark:text-white">
                                            {course._count.enrollments}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {course.isPublished ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
                                                    <span>✅</span>
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-bold">
                                                    <span>📝</span>
                                                    Draft
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
