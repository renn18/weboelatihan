import type { Course } from "@/app/generated/prisma/client"
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
  course: Course
}

export default function CourseCard({ course }: Props) {
  return (
    <Link href={`/dashboard/courses/${course.slug}`}>
      <Card className="rounded-2xl hover:shadow-md transition">
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold text-lg">{course.title}</h2>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {course.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}