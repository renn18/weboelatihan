import Image from 'next/image'
import Link from 'next/link'
import CourseCardClient from './CourseCardClient'

interface Course {
  id: string
  title: string
  slug: string
  price: number
  thumbnail: string | null
  description?: string
  category?: string
  user?: {
    name?: string
  }
}

export default function CourseCard({ course }: { course: Course }) {
  return (
    <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 border border-white/70 dark:border-gray-700/70 hover:border-blue-200/70 dark:hover:border-blue-800/50 overflow-hidden">

      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-indigo-600 overflow-hidden">
        <Image
          src={course.thumbnail ?? '/placeholder.png'}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          priority={false}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">

        {/* Category Badge */}
        {course.category && (
          <div className="inline-block">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wide">
              {course.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Instructor */}
        {course.user?.name && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
            <span className="text-lg">👨‍🏫</span>
            <span className="font-semibold">{course.user.name}</span>
          </div>
        )}

        {/* Price & Button */}
        <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Harga</span>
            <div className="text-2xl font-black text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
              {course.price === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400">Gratis</span>
              ) : (
                `Rp ${course.price.toLocaleString('id-ID')}`
              )}
            </div>
          </div>

          {/* Client Component - Enroll & Details Button */}
          <CourseCardClient courseSlug={course.slug} />
        </div>
      </div>
    </div>
  )
}
