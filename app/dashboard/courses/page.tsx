import { prisma } from '@/lib/prisma'
import CoursesClient from './CourseClient'

export const metadata = {
    title: 'Kursus - Eduhub',
    description: 'Jelajahi dan kelola kursus yang tersedia di platform Eduhub',
}

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ params?: string }>
}) {
    const { params } = await searchParams
    const page = Number((await searchParams).params) || 1
    const take = 6
    const skip = (page - 1) * take

    const [courses, total] = await Promise.all([
        prisma.course.findMany({
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.course.count(),
    ])

    return (
        <CoursesClient
            courses={courses}
            total={total}
            page={page}
            perPage={take}
        />
    )
}
