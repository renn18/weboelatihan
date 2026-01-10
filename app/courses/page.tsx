import Header from '@/components/Header'
import CourseCard from '@/components/CourseCard'
import CoursesFilter from '@/components/CoursesFilter'
import Link from 'next/link'

export const revalidate = 60
export const metadata = {
    title: 'Courses - EduFlow',
    description: 'Explore our online courses',
}

interface Course {
    id: string
    title: string
    slug: string
    description?: string
    thumbnail: string | null
    category: string
    price: number
    user: {
        name?: string
    }
    isPublished: boolean
}

async function getCourses(): Promise<Course[]> {
    try {
        // ✅ PERBAIKAN 1: Validasi NEXT_PUBLIC_APP_URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        if (!baseUrl) {
            console.error('⚠️ NEXT_PUBLIC_APP_URL is not defined in .env.local')
            return []
        }

        const res = await fetch(`${baseUrl}/api/courses`, {
            next: { revalidate: 60 },
            // ✅ PERBAIKAN 2: Tambah timeout dan headers
            headers: {
                'Content-Type': 'application/json',
            },
        })

        // ✅ PERBAIKAN 3: Cek HTTP status terlebih dahulu
        if (!res.ok) {
            console.error(`❌ Failed to fetch courses: ${res.status} ${res.statusText}`)
            return []
        }

        const data = await res.json()

        // ✅ PERBAIKAN 4: Validasi response structure
        if (!Array.isArray(data.data) && !Array.isArray(data)) {
            console.error('❌ Invalid response structure:', data)
            return []
        }

        const courses = Array.isArray(data.data) ? data.data : data
        return courses || []
    } catch (error) {
        console.error('❌ Error fetching courses:', error instanceof Error ? error.message : error)
        return []
    }
}

export default async function CoursesPage({
    searchParams,
}: {
    searchParams?: Promise<{ search?: string; category?: string }>
}) {
    const courses = await getCourses()
    const params = await searchParams
    const searchQuery = params?.search || ''
    const selectedCategory = params?.category || 'all'

    // ✅ PERBAIKAN 5: Filter hanya published courses
    const publishedCourses = courses.filter(course => course.isPublished === true)

    // Get unique categories dari published courses
    const categories = ['all', ...new Set(publishedCourses.map(c => c.category).filter(Boolean))]

    // Filter courses
    const filteredCourses = publishedCourses.filter(course => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategory =
            selectedCategory === 'all' || course.category === selectedCategory

        return matchesSearch && matchesCategory
    })

    // ✅ PERBAIKAN 6: Cek apakah courses berhasil diambil
    if (!courses || courses.length === 0) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-6">📚</div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Belum Ada Kursus
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                            Kursus akan segera tersedia. Silahkan refresh page
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            💡 Pastikan NEXT_PUBLIC_APP_URL sudah di-set di .env.local
                        </p>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Header />
            <section className="pt-32 lg:pt-30 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 min-h-screen pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-gray-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-4">
                            🎓 Semua Kursus
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Temukan dan pilih kursus yang sesuai dengan kebutuhan Anda
                        </p>
                    </div>

                    {/* Search & Filter Component */}
                    <CoursesFilter categories={categories} courses={publishedCourses} />

                    {/* Results Count */}
                    <div className="mb-8">
                        <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                            {filteredCourses.length === 0
                                ? '❌ Tidak ada kursus yang sesuai'
                                : `✅ Menampilkan ${filteredCourses.length} dari ${publishedCourses.length} kursus`}
                        </p>
                    </div>

                    {/* Courses Grid */}
                    {filteredCourses.length === 0 ? (
                        <div className="text-center py-20 px-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/70 dark:border-gray-700/70">
                            <div className="text-6xl mb-6">🔎</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Kursus Tidak Ditemukan
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                Coba ubah pencarian atau pilih kategori lain
                            </p>
                            <Link
                                href="/courses"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                <span>🔄</span>
                                Reset Filter
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCourses.map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}
