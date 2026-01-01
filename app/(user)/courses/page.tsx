import Header from '@/components/Header'
import Image from 'next/image'
import Link from 'next/link'

async function getCourses() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/courses`, {
        cache: 'no-store',
    })
    return res.json()
}

export default async function CoursesPage() {
    const { data: courses } = await getCourses()

    if (!courses || courses.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Kursus</h1>
                <p>Belum ada kursus tersedia</p>
            </div>
        )
    }

    return (
        <>
            <Header />
            <section className="pt-32 lg:pt-30 overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            Semua Kursus
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Pilih kursus yang ingin Anda ikuti
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course: any) => (
                            <Link
                                key={course.id}
                                href={`/courses/${course.slug}`}
                                className="group block p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border hover:border-blue-200"
                            >
                                <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 group-hover:scale-105 transition-transform duration-300">
                                    {course.thumbnail ? (
                                        <Image
                                            width={400}
                                            height={300}
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-gray-400 text-sm">Preview</span>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600">
                                    {course.title}
                                </h3>

                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                                    {course.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        {course.category && (
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                                                {course.category}
                                            </span>
                                        )}
                                        <span className="text-gray-500">
                                            oleh {course.user.name}
                                        </span>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {course.price === 0 ? 'Gratis' : `Rp ${course.price.toLocaleString()}`}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}
