import { prisma } from '../../../../lib/prisma'
import { notFound } from 'next/navigation'


export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const course = await prisma.course.findUnique({
        where: { slug: slug },
    })

    if (!course) return notFound()

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-4">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>
        </div>
    )
}
