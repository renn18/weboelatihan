import { clerkClient, auth } from '@clerk/nextjs/server'
// import { redirect } from 'next/navigation'
import UserTable from './user-table'

type UserDTO = {
    id: string
    name: string
    email: string
    role: 'admin' | 'user'
}

export default async function UsersPage() {
    // const { sessionClaims } = await auth()

    // const role = (sessionClaims?.publicMetadata as { role?: string })?.role
    // if (role !== 'admin') redirect('/')

    const client = await clerkClient()
    const users = await client.users.getUserList({ limit: 100 })

    // ✅ SERIALIZE (INI KUNCINYA)
    const serializedUsers: UserDTO[] = users.data.map((u) => ({
        id: u.id,
        name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '—',
        email: u.emailAddresses[0]?.emailAddress ?? '-',
        role: (u.publicMetadata?.role as 'admin' | 'user') ?? 'user',
    }))

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Manajemen User</h1>
            <UserTable users={serializedUsers} />
        </div>
    )
}
