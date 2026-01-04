'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CourseCardClientProps {
    courseSlug: string
}

export default function CourseCardClient({ courseSlug }: CourseCardClientProps) {
    const router = useRouter()
    const [isHovered, setIsHovered] = useState(false)

    const handleViewDetails = () => {
        router.push(`/courses/${courseSlug}`)
    }

    return (
        <Link href={`/courses/${courseSlug}`}>
            <button
                onClick={handleViewDetails}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 active:scale-95"
            >
                <span>{isHovered ? '→' : '📖'}</span>
                {isHovered ? 'Lihat Detail' : 'Pelajari'}
            </button>
        </Link>
    )
}
