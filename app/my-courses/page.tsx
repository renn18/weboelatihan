import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import StudentEnrollmentsPage from '../student/enrollments/page'

interface PageProps {
    searchParams?: Promise<{ sort?: string }>
}

export default async function MyCourses({ searchParams }: PageProps) {
    const sp = await searchParams
    const sort = sp?.sort || 'newest'

    const { userId: clerkUserId } = await auth()
    console.log('🔑 Clerk User ID:', clerkUserId)

    if (!clerkUserId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
                <div className="text-center">
                    <Link
                        href="/sign-in"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-xl"
                    >
                        🔐 Login untuk Melanjutkan
                    </Link>
                </div>
            </div>
        )
    }

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    })

    if (!dbUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-8">
                <div className="text-center max-w-md space-y-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-400 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Tidak Ditemukan</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Akun Anda belum terdaftar di sistem</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/sign-out"
                            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            Logout
                        </Link>
                        <Link
                            href="/"
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            Beranda
                        </Link>
                    </div>
                </div>
            </div>
        )
    }
    return (<StudentEnrollmentsPage />)
}
