'use client'

import { useRouter } from 'next/navigation'
import CourseManager from './CourseManager'
import { Course } from '@/lib/types/course'  // ✅ IMPORT

interface InstructorDashboardClientProps {
    courses: Course[]
    userName?: string | null
}

export default function InstructorDashboardClient({
    courses,
    userName,
}: InstructorDashboardClientProps) {
    const router = useRouter()

    return (
        <div className="space-y-10">
            {/* Welcome Section */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-black bg-gradient-to-r from-purple-900 to-indigo-900 dark:from-purple-100 dark:to-indigo-100 bg-clip-text text-transparent mb-4">
                    Halo, {userName || 'Instruktur'}! 👋
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                    Kelola dan kembangkan kursus Anda di sini
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                    <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-2">
                        {courses.length}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">
                        Total Kursus
                    </p>
                </div>

                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                    <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                        {courses.filter(c => c.isPublished).length}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">
                        Kursus Published
                    </p>
                </div>

                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                    <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-2">
                        {courses.reduce((acc, c) => acc + (c.enrollments?.length || 0), 0)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">
                        Total Siswa
                    </p>
                </div>
            </div>

            {/* Course Manager */}
            <CourseManager courses={courses} />
        </div>
    )
}
