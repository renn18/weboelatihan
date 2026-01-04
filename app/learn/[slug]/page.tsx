import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import LearningClient from './LearningClient'

interface PageProps {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ enrollmentId?: string }>
}

export default async function LearnPage({ params, searchParams }: PageProps) {
    // ✅ NEXT.JS 16: Await params dan searchParams
    const { slug } = await params
    const { enrollmentId } = await searchParams

    console.log('📖 Learn Page - slug:', slug)

    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <Link
                    href="/sign-in"
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                    🔐 Login untuk Belajar
                </Link>
            </div>
        )
    }

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    })

    if (!dbUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-8">
                <div className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Tidak Ditemukan</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Akun Anda belum terdaftar di sistem</p>
                    <Link
                        href="/"
                        className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl"
                    >
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        )
    }

    // ✅ Get course dengan slug
    const course = await prisma.course.findFirst({
        where: { slug },
        include: {
            sections: {
                orderBy: { order: 'asc' },
                include: {
                    lessons: {
                        orderBy: { order: 'asc' },
                    },
                },
            },
            user: { select: { name: true, image: true } },
        },
    })

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-8">
                <div className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Kursus Tidak Ditemukan</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Kursus yang Anda cari tidak ada</p>
                    <Link
                        href="/courses"
                        className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl"
                    >
                        Kembali ke Katalog
                    </Link>
                </div>
            </div>
        )
    }

    // ✅ Check enrollment
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            userId: dbUser.id,
            courseId: course.id,
        },
        include: {
            progress: {
                include: { lesson: true },
            },
        },
    })

    if (!enrollment) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-8">
                <div className="text-center max-w-md space-y-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Belum Terdaftar
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Anda belum terdaftar di kursus ini. Silakan daftar terlebih dahulu.
                    </p>
                    <Link
                        href={`/courses/${course.slug}`}
                        className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        Daftar Sekarang
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <LearningClient
            course={course}
            enrollment={enrollment}
            userId={dbUser.id}
        />
    )
}
