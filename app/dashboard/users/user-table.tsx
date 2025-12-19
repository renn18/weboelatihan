'use client'

import { useTransition } from 'react'
import { updateUserRole } from './actions'

type UserDTO = {
    id: string
    name: string
    email: string
    role: 'admin' | 'user'
}

export default function UserTable({ users }: { users: UserDTO[] }) {
    const [pending, startTransition] = useTransition()

    return (
        <div className="rounded-xl border">
            <table className="w-full text-sm">
                <thead className="bg-muted">
                    <tr>
                        <th className="p-3 text-left">Nama</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Role</th>
                        <th className="p-3 text-left">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-t">
                            <td className="p-3">{user.name}</td>
                            <td className="p-3">{user.email}</td>
                            <td className="p-3 capitalize">{user.role}</td>
                            <td className="p-3">
                                <select
                                    defaultValue={user.role}
                                    disabled={pending}
                                    onChange={(e) =>
                                        startTransition(() =>
                                            updateUserRole(
                                                user.id,
                                                e.target.value as 'admin' | 'user'
                                            )
                                        )
                                    }
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
