'use client'

import { EnrollButton } from '@/components/EnrollButton'
import Image from 'next/image'
import Link from 'next/link'

interface Course {
    id: string
    title: string
    slug: string
    price: number
    thumbnail: string | null
}

export default function CourseCard({ course }: { course: Course }) {
    return (
        <div className="rounded-xl border bg-card hover:shadow-md transition">
            <div className="relative h-40 w-full">
                <Image
                    src={course.thumbnail ?? '/placeholder.png'}
                    alt={course.title}
                    fill
                    className="object-cover rounded-t-xl"
                />
            </div>

            <div className="p-4 space-y-2">
                <h3 className="font-semibold line-clamp-2">
                    {course.title}
                </h3>

                <p className="text-sm text-muted-foreground">
                    Rp {course.price.toLocaleString('id-ID')}
                </p>

                <Link
                    href={`/courses/${course.slug}`}
                    className="text-sm text-indigo-600 font-medium hover:underline"
                >
                    Lihat Detail
                </Link>
            </div>
        </div>
    )
}