'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface CourseCardProps {
    courseData: {
        id: string
        course: {
            id: string
            slug: string
            title: string
            thumbnail?: string
            user: {
                name: string
                image?: string
            }
        }
        enrolledAt: Date
    }
}

export default function CourseCard({ courseData }: CourseCardProps) {
    const router = useRouter()
    const course = courseData.course

    const handleNavigate = () => {
        router.push(`/learn/${course.slug}`)
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div
            onClick={handleNavigate}
            className="group cursor-pointer bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-4 transition-all duration-700 border border-white/70 dark:border-gray-700/70 hover:border-blue-200/70 dark:hover:border-blue-800/50 overflow-hidden relative"
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/0 via-blue-500/0 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Course Image/Thumbnail */}
            <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                {course.thumbnail ? (
                    <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400/30 via-indigo-400/30 to-purple-400/30">
                        <span className="text-5xl drop-shadow-lg">📖</span>
                    </div>
                )}

                {/* Date Badge */}
                <div className="absolute top-4 right-4 px-4 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {new Date(courseData.enrolledAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-10 relative z-10">

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-start gap-4 flex-1">

                        {/* Instructor Avatar */}
                        <div className="w-16 h-16 mt-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/70 dark:ring-gray-700/70 flex-shrink-0">
                            {course.user?.image ? (
                                <Image
                                    src={course.user.image}
                                    alt={course.user.name}
                                    width={64}
                                    height={64}
                                    className="rounded-2xl w-full h-full object-cover"
                                />
                            ) : (
                                <span className="font-bold text-xl text-gray-700 dark:text-gray-300 drop-shadow">
                                    {getInitials(course.user?.name || 'I')}
                                </span>
                            )}
                        </div>

                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 drop-shadow-sm">
                                {course.title}
                            </h3>

                            <p className="text-base text-gray-600 dark:text-gray-400 mb-2 font-medium">
                                oleh {course.user?.name || 'Instruktur'}
                            </p>

                            <p className="text-sm text-gray-500 dark:text-gray-500 font-medium">
                                Dimulai {new Date(courseData.enrolledAt).toLocaleDateString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Placeholder */}
                <div className="mb-10 p-6 bg-gradient-to-r from-gray-50/80 to-blue-50/80 dark:from-gray-800/80 dark:to-blue-900/20 rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                            📊 Progress
                        </span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400 animate-pulse">
                            Siap Dimulai
                        </span>
                    </div>

                    <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-4 shadow-inner overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-400/60 to-gray-500/60 dark:from-gray-500/60 dark:to-gray-600/60 h-4 rounded-full shadow-lg w-4 animate-pulse" />
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
                    <button
                        onClick={handleNavigate}
                        className="group/btn flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ring-2 ring-blue-200/50 hover:ring-blue-300/70 dark:ring-blue-900/50 backdrop-blur-sm"
                    >
                        <span className="text-xl group-hover/btn:scale-125 group-hover/btn:rotate-6 transition-all duration-300">▶️</span>
                        <span className="tracking-wide font-semibold">Lanjut Belajar</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
