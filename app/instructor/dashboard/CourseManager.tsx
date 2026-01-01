'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Course {
    id: string
    title: string
    slug: string
    description: string
    price: number
    status: string
    thumbnail?: string
    enrollments: any[]
    sections: any[]
}

interface CourseManagerProps {
    courses: Course[]
}

export default function CourseManager({ courses }: CourseManagerProps) {
    const [filter, setFilter] = useState('all')

    const filteredCourses = courses.filter(course => {
        if (filter === 'published') return course.status === 'published'
        if (filter === 'draft') return course.status === 'draft'
        return true
    })

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-4">
                    <span className="text-3xl">📚</span>
                    Kursus Saya ({filteredCourses.length})
                </h2>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                    {['all', 'published', 'draft'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-2 rounded-2xl font-semibold transition-all capitalize ${filter === status
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Courses Table */}
            {filteredCourses.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Belum ada kursus
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Mulai buat kursus pertama Anda sekarang
                    </p>
                    <Link
                        href="/instructor/courses/new"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        <span>➕</span>
                        Buat Kursus
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                                <th className="text-left py-4 px-6 font-bold text-gray-900 dark:text-white">Kursus</th>
                                <th className="text-center py-4 px-6 font-bold text-gray-900 dark:text-white">Siswa</th>
                                <th className="text-center py-4 px-6 font-bold text-gray-900 dark:text-white">Pelajaran</th>
                                <th className="text-center py-4 px-6 font-bold text-gray-900 dark:text-white">Harga</th>
                                <th className="text-center py-4 px-6 font-bold text-gray-900 dark:text-white">Status</th>
                                <th className="text-right py-4 px-6 font-bold text-gray-900 dark:text-white">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map(course => (
                                <tr
                                    key={course.id}
                                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    {/* Course Title */}
                                    <td className="py-6 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400/30 to-indigo-400/30 flex items-center justify-center">
                                                <span>📖</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white line-clamp-1">
                                                    {course.title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {course.slug}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Students Count */}
                                    <td className="py-6 px-6 text-center">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {course.enrollments.length}
                                        </div>
                                    </td>

                                    {/* Lessons Count */}
                                    <td className="py-6 px-6 text-center">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                            {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)}
                                        </div>
                                    </td>

                                    {/* Price */}
                                    <td className="py-6 px-6 text-center">
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            {course.price === 0 ? (
                                                <span className="text-emerald-600 dark:text-emerald-400">Gratis</span>
                                            ) : (
                                                `Rp ${course.price.toLocaleString()}`
                                            )}
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="py-6 px-6 text-center">
                                        <span
                                            className={`px-4 py-2 rounded-full font-semibold text-sm ${course.status === 'published'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                }`}
                                        >
                                            {course.status === 'published' ? '✅ Published' : '📝 Draft'}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="py-6 px-6 text-right space-x-2">
                                        <Link
                                            href={`/instructor/courses/${course.id}/edit`}
                                            className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all"
                                        >
                                            ✏️ Edit
                                        </Link>
                                        <Link
                                            href={`/instructor/courses/${course.id}/sections`}
                                            className="inline-flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-all"
                                        >
                                            📚 Sections
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
