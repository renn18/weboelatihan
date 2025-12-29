import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import CourseCard from './course-card'

export default async function UserCoursesPage() {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) return null

    const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    })

    if (!user) return null

    const courses = await prisma.course.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            thumbnail: true,
            createdAt: true,
            user: {
                select: { clerkId: true }
            }
        },
    })

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Kelas Saya</h1>

            {courses.length === 0 && (
                <p className="text-muted-foreground">
                    Anda belum memiliki kelas.
                </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        </div>
    )
}