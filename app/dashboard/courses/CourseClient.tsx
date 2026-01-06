'use client'

import type { Course } from '@prisma/client'
import CourseModal from './CourseModal'
import DeleteConfirm from './DeleteConfirm'
import ThumbnailUpload from './ThumbnailUpload'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import CoursePublishSwitch from './CoursePublishSwitch'

export default function CoursesClient({
    courses,
    total,
    page,
    perPage,
}: {
    courses: Course[]
    total: number
    page: number
    perPage: number
}) {

    const [search, setSearch] = useState('')

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between">
                <Input
                    placeholder="Cari kelas..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-sm"
                />

                <CourseModal />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {courses.map(course => (
                    <Card key={course.id}>

                        <CardContent className="p-4 space-y-2">
                            <Link href={`/dashboard/courses/${course.slug}`} key={course.id}>
                                <h3 className="font-semibold mb-3">{course.title}</h3>
                            </Link>

                            <div className="flex gap-2">
                                <CourseModal course={course} />
                                <DeleteConfirm id={course.id} />
                            </div>

                            <ThumbnailUpload id={course.id} currentThumbnail={course.thumbnail} />
                            <CoursePublishSwitch courseId={course.id} published={course.isPublished} />
                        </CardContent>
                    </Card>
                ))}
            </div>
            {filteredCourses.length === 0 && (
                <p className="text-muted-foreground">Kelas tidak ditemukan</p>
            )}
        </div>

    )
}
