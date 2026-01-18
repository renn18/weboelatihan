import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import StudentEnrollmentsClient from './StudentEnrollmentsClient'
import { Button } from '@/components/ui/button'

export default async function StudentEnrollmentsPage() {
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
        include: {
            enrollments: {
                where: {
                    status: "active"
                },
                include: {
                    course: true,
                    certificate: true,
                    progress: true,
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    })

    if (!dbUser) {
        return <div className="min-h-screen flex items-center justify-center">User not found</div>
    }

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
        dbUser.enrollments.map(async (enrollment) => {
            const totalLessons = await prisma.lesson.count({
                where: {
                    section: {
                        courseId: enrollment.courseId,
                    },
                },
            })

            const completedLessons = enrollment.progress.filter(
                (p) => p.isCompleted
            ).length

            const progressPercentage =
                totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

            return {
                ...enrollment,
                progressPercentage,
            }
        })
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/">
                    <Button variant="default" className="mb-8">
                        ← Kembali ke HomePage
                    </Button>
                </Link>
                <StudentEnrollmentsClient enrollments={enrollmentsWithProgress} />
            </div>
        </div>
    )
}
