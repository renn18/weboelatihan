import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
        redirect('/sign-in')
    }

    const admin = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    })

    if (!admin || admin.role !== 'admin') {
        redirect('/')
    }

    // Fetch all users
    const users = await prisma.user.findMany({
        select: {
            id: true,
            clerkId: true,
            email: true,
            name: true,
            role: true,
            image: true,
            createdAt: true,
            _count: {
                select: {
                    courses: true,
                    enrollments: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-black mb-10 text-gray-900 dark:text-white">
                    👥 Kelola Pengguna
                </h1>
                <AdminUsersClient users={users} />
            </div>
        </div>
    )
}
