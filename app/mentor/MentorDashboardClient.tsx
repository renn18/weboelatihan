'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Course {
    id: string
    title: string
    slug: string
    description: string | null
    thumbnail: string | null
    category: string
    price: number
    isPublished: boolean
    createdAt: Date
    totalLessons: number
    totalEnrollments: number
    completedEnrollments: number
    avgProgress: number
}

interface MentorDashboardClientProps {
    courses: Course[]
}

export default function MentorDashboardClient({ courses }: MentorDashboardClientProps) {
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')

    const filteredCourses = courses.filter(course => {
        if (filterStatus === 'published') return course.isPublished
        if (filterStatus === 'draft') return !course.isPublished
        return true
    })

    return (
        <div className="space-y-8">

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
                {(['all', 'published', 'draft'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 ${filterStatus === status
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500'
                            }`}
                    >
                        {status === 'all' && `📚 Semua (${courses.length})`}
                        {status === 'published' && `✅ Dipublikasikan (${courses.filter(c => c.isPublished).length})`}
                        {status === 'draft' && `📝 Draft (${courses.filter(c => !c.isPublished).length})`}
                    </button>
                ))}
            </div>

            {/* Courses Grid */}
            {filteredCourses.length === 0 ? (
                <div className="text-center py-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Tidak ada kursus dengan status ini
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredCourses.map(course => (
                        <div
                            key={course.id}
                            className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                        >

                            {/* Thumbnail */}
                            <div className="relative h-48 bg-gradient-to-br from-blue-400 to-indigo-600 overflow-hidden">
                                {course.thumbnail ? (
                                    <Image
                                        src={course.thumbnail}
                                        alt={course.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl">
                                        📚
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    {course.isPublished ? (
                                        <span className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-500/90 text-white font-bold text-sm rounded-full shadow-lg">
                                            <span>✅</span>
                                            Dipublikasikan
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-4 py-2 bg-gray-500/90 text-white font-bold text-sm rounded-full shadow-lg">
                                            <span>📝</span>
                                            Draft
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">

                                {/* Category */}
                                {course.category && (
                                    <div className="inline-block">
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase">
                                            {course.category}
                                        </span>
                                    </div>
                                )}

                                {/* Title */}
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                                    {course.title}
                                </h3>

                                {/* Description */}
                                {course.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {course.description}
                                    </p>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200 dark:border-gray-700">

                                    {/* Lessons */}
                                    <div className="text-center">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Pelajaran</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            {course.totalLessons}
                                        </p>
                                    </div>

                                    {/* Enrollments */}
                                    <div className="text-center">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Pendaftar</p>
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                            {course.totalEnrollments}
                                        </p>
                                    </div>

                                    {/* Completed */}
                                    <div className="text-center">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Selesai</p>
                                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                            {course.completedEnrollments}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Rata-rata Progress
                                        </span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            {course.avgProgress}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                                            style={{ width: `${course.avgProgress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-3 pt-4">

                                    {/* Edit Button */}
                                    <Link
                                        href={`/mentor/edit-course/${course.id}`}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-center text-sm"
                                    >
                                        ✏️ Edit
                                    </Link>

                                    {/* Manage Students Button */}
                                    <Link
                                        href={`/mentor/course/${course.id}/students`}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all text-center text-sm"
                                    >
                                        👥 Siswa
                                    </Link>

                                    {/* View Course Button */}
                                    <Link
                                        href={`/courses/${course.slug}`}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all text-center text-sm"
                                    >
                                        🔍 Lihat
                                    </Link>

                                    {/* Manage Content Button */}
                                    <Link
                                        href={`/mentor/course/${course.id}/content`}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all text-center text-sm"
                                    >
                                        📝 Konten
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
