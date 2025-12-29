'use client'

import { Switch } from '@/components/ui/switch'
import { publishCourse } from './actions'
import { useTransition } from 'react'

type Props = {
    courseId: string
    published: boolean
}

export default function CoursePublishSwitch({
    courseId,
    published,
}: Props) {
    const [isPending, startTransition] = useTransition()

    return (
        <div className="flex items-center gap-2">
            <Switch
                checked={published}
                disabled={isPending}
                onCheckedChange={() =>
                    startTransition(() => publishCourse(courseId))
                }
            />
            <span
                className={`text-sm ${published ? 'text-green-600' : 'text-gray-500'
                    }`}
            >
                {published ? 'Published' : 'Draft'}
            </span>
        </div>
    )
}
