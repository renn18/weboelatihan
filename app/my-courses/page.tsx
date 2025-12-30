import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'

async function getUserEnrollments() {
    const { userId } = await auth()
    if (!userId) return { enrolledCourses: [] }

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/enrollments`, {
        headers: {
            Cookie: `auth_token=${userId}`, // Pass Clerk session
        },
        cache: 'no-store',
    })

    const data = await res.json()
    return data
}

export default async function UserDashboard() {
    const { enrolledCourses } = await getUserEnrollments()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-block w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                        <span className="text-3xl">📚</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
                        Dashboard Belajar
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Lanjutkan perjalanan belajar Anda. Pantau progress dan dapatkan sertifikat.
                    </p>
                </div>

                {/* Stats */}
                {enrolledCourses.length > 0 && (
                    <div className="grid md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50">
                            <div className="text-3xl font-black text-emerald-600 mb-2">
                                {enrolledCourses.length}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 font-medium">Kursus Aktif</div>
                        </div>
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50">
                            <div className="text-3xl font-black text-blue-600 mb-2">
                                {enrolledCourses.filter(course => course.completedLessons === course.totalLessons).length}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 font-medium">Selesai</div>
                        </div>
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50">
                            <div className="text-3xl font-black text-indigo-600 mb-2">
                                {enrolledCourses.filter(course => course.hasCertificate).length}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 font-medium">Sertifikat</div>
                        </div>
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50">
                            <Link href="/courses" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                + Lihat Kursus Baru
                            </Link>
                        </div>
                    </div>
                )}

                {/* Enrolled Courses */}
                <div className="space-y-8">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-4">
                        <span className="text-3xl">🎯</span>
                        Kursus Saya
                    </h2>

                    {enrolledCourses.length === 0 ? (
                        <div className="text-center py-32">
                            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center">
                                <span className="text-4xl">📚</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Belum ada kursus
                            </h3>
                            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                Mulai belajar dengan memilih kursus dari katalog
                            </p>
                            <Link
                                href="/courses"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <span className="text-xl">🚀</span>
                                Jelajahi Kursus
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {enrolledCourses.map((course: any) => (
                                <Link
                                    key={course.id}
                                    href={`/courses/${course.course.slug}?enrollmentId=${course.id}`}
                                    className="group block p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white/50 hover:border-blue-200/50"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            {course.course.thumbnail ? (
                                                <img
                                                    src={course.course.thumbnail}
                                                    alt={course.course.title}
                                                    className="w-20 h-20 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-2xl flex items-center justify-center shadow-lg">
                                                    <span className="text-xl">📖</span>
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600">
                                                    {course.course.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    oleh {course.course.user.name}
                                                </p>
                                            </div>
                                        </div>

                                        {course.hasCertificate && (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-800 dark:text-emerald-200 rounded-2xl font-semibold shadow-md">
                                                <span className="text-lg">🏆</span>
                                                Sertifikat
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-8">
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            <span>Progress: {Math.round((course.completedLessons / course.totalLessons) * 100)}%</span>
                                            <span>
                                                {course.completedLessons}/{course.totalLessons} pelajaran
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full shadow-lg transition-all duration-700 ease-out"
                                                style={{
                                                    width: `${(course.completedLessons / course.totalLessons) * 100}%`,
                                                    minWidth: '20px'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Mulai: {new Date(course.enrolledAt).toLocaleDateString('id-ID')}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                                                Lanjut Belajar
                                            </span>
                                            {course.hasCertificate && (
                                                <Link
                                                    href={`/certificates/${course.id}`}
                                                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                                >
                                                    Unduh Sertifikat
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
