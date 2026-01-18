import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import InstructorDashboardClient from './InstructorDashboardClient'
import { Course } from '@/lib/types/course'  // ✅ IMPORT
import Header from '@/components/Header'

export default async function InstructorDashboardPage() {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Link href="/sign-in">Login terlebih dahulu</Link>
            </div>
        )
    }

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    })

    if (!dbUser || dbUser.role == 'user') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Akses Terbatas</h2>
                    <p>Hanya instruktur yang bisa mengakses halaman ini</p>
                </div>
            </div>
        )
    }

    const courses = await prisma.course.findMany({
        where: { userId: dbUser.id },
        include: {
            enrollments: true,  // ✅ INCLUDE enrollments
            sections: {
                include: {
                    lessons: true,  // ✅ INCLUDE lessons
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    }) as Course[]  // ✅ CAST ke Course type

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
                <Header />
                <div className="max-w-7xl mx-auto pt-20 pb-32">
                    <InstructorDashboardClient courses={courses} userName={dbUser.name} />
                </div>
            </div>

        </>

    )
}
