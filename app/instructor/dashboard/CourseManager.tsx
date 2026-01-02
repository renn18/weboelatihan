'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Course } from '@/lib/types/course'  // ✅ IMPORT

interface CourseManagerProps {
    courses: Course[]
}

export default function CourseManager({ courses }: CourseManagerProps) {
    const router = useRouter()
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
    const [loading, setLoading] = useState<string | null>(null)

    const filteredCourses = courses.filter(course => {
        if (filter === 'published') return course.isPublished === true
        if (filter === 'draft') return course.isPublished === false
        return true
    })

    // Toggle published status
    const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
        if (
            !confirm(
                currentStatus
                    ? 'Hapus publikasi kursus ini?'
                    : 'Publikasikan kursus ini?'
            )
        ) {
            return
        }

        setLoading(courseId)
        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isPublished: !currentStatus,
                }),
            })

            const data = await res.json()

            if (data.success) {
                router.refresh()
                alert(currentStatus ? '✅ Kursus dihapus publikasi' : '✅ Kursus dipublikasikan')
            } else {
                alert('❌ Error: ' + data.error)
            }
        } catch (error) {
            console.error(error)
            alert('Error')
        } finally {
            setLoading(null)
        }
    }

    // Delete course
    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm('Hapus kursus ini? (Tidak bisa dikembalikan)')) {
            return
        }

        setLoading(courseId)
        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: 'DELETE',
            })

            const data = await res.json()

            if (data.success) {
                router.refresh()
                alert('✅ Kursus berhasil dihapus')
            } else {
                alert('❌ Error: ' + data.error)
            }
        } catch (error) {
            console.error(error)
            alert('Error menghapus kursus')
        } finally {
            setLoading(null)
        }
    }

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
                            onClick={() => setFilter(status as 'all' | 'published' | 'draft')}
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

            {/* Create New Course Button */}
            <Link
                href="/instructor/courses/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
                <span>➕</span>
                Buat Kursus Baru
            </Link>

            {/* Courses Table */}
            {filteredCourses.length === 0 ? (
                <div className="text-center py-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Belum ada kursus
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        {filter === 'all'
                            ? 'Mulai buat kursus pertama Anda sekarang'
                            : `Tidak ada kursus ${filter}`}
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
                <div className="overflow-x-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                                <th className="text-left py-4 px-6 font-bold text-gray-900 dark:text-white">
                                    Kursus
                                </th>
                                <th className="text-center py-4 px-6 font-bold text-gray-900 dark:text-white">
                                    Siswa
                                </th>
                                <th className="text-center py-4 px-6 font-bold text-gray-900 dark:text-white">
                                    Pelajaran
                                </th>
                                <th className="text-center py-4 px-6 font-bold text-gray-900 dark:text-white">
                                    Harga
                                </th>
                                <th className="text-center py-4 px-6 font-bold text-gray-900 dark:text-white">
                                    Status
                                </th>
                                <th className="text-right py-4 px-6 font-bold text-gray-900 dark:text-white">
                                    Aksi
                                </th>
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
                                            {course.thumbnail ? (
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400/30 to-indigo-400/30 flex items-center justify-center flex-shrink-0">
                                                    <span>📖</span>
                                                </div>
                                            )}
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
                                            {course.enrollments?.length || 0}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">siswa</div>
                                    </td>

                                    {/* Lessons Count */}
                                    <td className="py-6 px-6 text-center">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                            {course.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">pelajaran</div>
                                    </td>

                                    {/* Price */}
                                    <td className="py-6 px-6 text-center">
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            {course.price === 0 ? (
                                                <span className="text-emerald-600 dark:text-emerald-400">Gratis</span>
                                            ) : (
                                                `Rp ${course.price.toLocaleString('id-ID')}`
                                            )}
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="py-6 px-6 text-center">
                                        <span
                                            className={`px-4 py-2 rounded-full font-semibold text-sm inline-block ${course.isPublished
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                }`}
                                        >
                                            {course.isPublished ? '✅ Published' : '📝 Draft'}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="py-6 px-6 text-right">
                                        <div className="flex gap-2 justify-end flex-wrap">
                                            <Link
                                                href={`/instructor/courses/new?courseId=${course.id}`}
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

                                            <button
                                                onClick={() =>
                                                    handleTogglePublish(course.id, course.isPublished)
                                                }
                                                disabled={loading === course.id}
                                                className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${course.isPublished
                                                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                    }`}
                                            >
                                                {loading === course.id ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    </>
                                                ) : course.isPublished ? (
                                                    <>📤 Unpublish</>
                                                ) : (
                                                    <>📥 Publish</>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleDeleteCourse(course.id)}
                                                disabled={loading === course.id}
                                                className="inline-flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                🗑️ Hapus
                                            </button>
                                        </div>
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
