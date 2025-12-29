import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import UserTable from './user-table'

type UserDTO = {
    id: string
    name: string
    email: string
    role: 'admin' | 'user'
}

export default async function UsersPage() {
    // 1️⃣ Ambil Clerk user ID
    const { userId: clerkId } = await auth()
    if (!clerkId) redirect('/sign-in')

    // 2️⃣ Ambil role dari PRISMA
    const currentUser = await prisma.user.findUnique({
        where: { clerkId },
        select: { role: true },
    })

    // 3️⃣ BLOCK kalau bukan admin
    if (currentUser?.role !== 'admin') {
        redirect('/')
    }

    // 4️⃣ Ambil user dari CLERK (data identity)
    const client = await clerkClient()
    const users = await client.users.getUserList({ limit: 100 })

    // 5️⃣ Ambil role dari PRISMA (JOIN MANUAL)
    const prismaUsers = await prisma.user.findMany({
        select: {
            clerkId: true,
            role: true,
        },
    })

    const roleMap = new Map(
        prismaUsers.map(u => [u.clerkId, u.role])
    )

    // 6️⃣ SERIALIZE (AMAN KE CLIENT)
    const serializedUsers: UserDTO[] = users.data.map(u => ({
        id: u.id,
        name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '—',
        email: u.emailAddresses[0]?.emailAddress ?? '-',
        role: (roleMap.get(u.id) as 'admin' | 'user') ?? 'user',
    }))

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Manajemen User</h1>
            <UserTable users={serializedUsers} />
        </div>
    )
}
