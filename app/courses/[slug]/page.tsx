import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import CourseDetailClient from './CourseDetailClient'
import { auth } from '@clerk/nextjs/server'

interface PageProps {
    params: Promise<{ slug: string }>
}

async function getCourse(slug: string) {
    return await prisma.course.findUnique({
        where: { slug },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            sections: {
                include: {
                    lessons: {
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy: { order: 'asc' },
            },
        },
    })
}

async function checkEnrollment(userId: string, courseId: string) {
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId,
            },
        },
        select: {
            id: true,
            status: true,
        },
    })

    return enrollment
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const course = await getCourse(slug)

    if (!course) {
        return { title: 'Course Not Found' }
    }

    return {
        title: course.title,
        description: course.description,
        openGraph: {
            title: course.title,
            description: course.description,
            images: course.thumbnail ? [{ url: course.thumbnail }] : [],
        },
    }
}

export default async function CourseDetailPage({ params }: PageProps) {
    const { slug } = await params
    const course = await getCourse(slug)

    if (!course) {
        notFound()
    }

    const { userId: clerkUserId } = await auth()

    let enrollment = null
    if (clerkUserId) {
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { id: true },
        })

        if (dbUser) {
            enrollment = await checkEnrollment(dbUser.id, course.id)
        }
    }

    // Total lessons
    const totalLessons = course.sections.reduce(
        (acc, section) => acc + section.lessons.length,
        0
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">

            {/* Back Button */}
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                    >
                        <span>←</span>
                        Kembali ke Kursus
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Hero Section */}
                <div className="grid lg:grid-cols-3 gap-12 mb-20">

                    {/* Left - Info */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Category & Level */}
                        <div className="flex flex-wrap gap-3">
                            {course.category && (
                                <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold uppercase">
                                    {course.category}
                                </span>
                            )}
                            {course.level && (
                                <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-bold uppercase">
                                    {course.level}
                                </span>
                            )}
                            {course.isPublished ? (
                                <span className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-bold">
                                    ✅ Dipublikasikan
                                </span>
                            ) : (
                                <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-bold">
                                    🔒 Belum Dipublikasikan
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-gray-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-6">
                                {course.title}
                            </h1>

                            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                                {course.description}
                            </p>
                        </div>

                        {/* Course Stats */}
                        <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200 dark:border-gray-700">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">📚 Total Materi</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {course.sections.length} Bagian
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">📖 Total Pelajaran</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {totalLessons} Pelajaran
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">⏱️ Durasi</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {course.duration ? `${course.duration} Jam` : 'Fleksibel'}
                                </p>
                            </div>
                        </div>

                        {/* Instructor */}
                        <div className="flex items-center gap-4 p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                            {course.user?.image && (
                                <Image
                                    src={course.user.image}
                                    alt={course.user.name || 'Instructor'}
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            )}
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Diajarkan oleh</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {course.user?.name || 'Instruktur'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right - Thumbnail & Enroll */}
                    <div className="space-y-6">

                        {/* Thumbnail */}
                        <div className="relative h-64 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl overflow-hidden shadow-2xl">
                            {course.thumbnail ? (
                                <Image
                                    src={course.thumbnail}
                                    alt={course.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl">
                                    📚
                                </div>
                            )}
                        </div>

                        {/* Enrollment Card */}
                        <CourseDetailClient
                            courseSlug={course.slug}
                            price={course.price}
                            isEnrolled={!!enrollment}
                            enrollmentStatus={enrollment?.status}
                        />
                    </div>
                </div>

                {/* Lessons Section */}
                {course.sections.length > 0 && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                📚 Materi Pembelajaran
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {course.sections.length} bagian • {totalLessons} pelajaran
                            </p>
                        </div>

                        {/* Sections */}
                        <div className="space-y-4">
                            {course.sections.map((section, idx) => (
                                <details
                                    key={section.id}
                                    className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-200/50 dark:border-gray-700/50 open:border-blue-200/70 dark:open:border-blue-800/50"
                                >
                                    <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer select-none">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                                <span className="text-xl">📌</span>
                                                Bagian {idx + 1}: {section.title}
                                            </h3>
                                            {section.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {section.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 group-open:text-blue-600 dark:group-open:text-blue-400 transition-colors">
                                            <span className="text-sm font-semibold">
                                                {section.lessons.length} pelajaran
                                            </span>
                                            <span className="text-xl group-open:rotate-180 transition-transform">
                                                ▼
                                            </span>
                                        </div>
                                    </summary>

                                    {/* Lessons List */}
                                    <div className="px-6 pb-6 space-y-3 border-t border-gray-200/50 dark:border-gray-700/50">
                                        {section.lessons.map((lesson, lessonIdx) => (
                                            <div
                                                key={lesson.id}
                                                className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl hover:shadow-md transition-all border border-blue-100/50 dark:border-blue-800/30"
                                            >
                                                <div className="text-2xl pt-1">📖</div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                                        {lessonIdx + 1}. {lesson.title}
                                                    </h4>
                                                    {lesson.description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                            {lesson.description}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap gap-3 mt-2">
                                                        {lesson.isFree && (
                                                            <span className="inline-block px-2 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                                                                🔓 Preview Gratis
                                                            </span>
                                                        )}
                                                        {lesson.difficulty && (
                                                            <span className="inline-block px-2 py-1 text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                                                {lesson.difficulty === 'beginner'
                                                                    ? '🟢 Pemula'
                                                                    : lesson.difficulty === 'intermediate'
                                                                        ? '🟡 Menengah'
                                                                        : '🔴 Lanjutan'}
                                                            </span>
                                                        )}
                                                        {lesson.duration && (
                                                            <span className="inline-block px-2 py-1 text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                                                ⏱️ {lesson.duration} menit
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
