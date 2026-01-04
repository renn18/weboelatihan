'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    clerkId: string
    email: string | null
    name: string | null
    role: string
    image: string | null
    createdAt: Date
    _count: {
        courses: number
        enrollments: number
    }
}

interface AdminUsersClientProps {
    users: User[]
}

export default function AdminUsersClient({ users }: AdminUsersClientProps) {
    const router = useRouter()
    const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'instructor' | 'admin'>('all')
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [updating, setUpdating] = useState<string | null>(null)

    const filteredUsers = users.filter(u => roleFilter === 'all' || u.role === roleFilter)

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdating(userId)
        try {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            })

            if (!res.ok) {
                const data = await res.json()
                alert(`❌ ${data.error}`)
                return
            }

            alert('✅ Role updated')
            router.refresh()
        } catch (error) {
            alert('❌ Error updating role')
        } finally {
            setUpdating(null)
        }
    }

    return (
        <div className="space-y-8">

            {/* Filter */}
            <div className="flex flex-wrap gap-3">
                {(['all', 'user', 'instructor', 'admin'] as const).map(role => (
                    <button
                        key={role}
                        onClick={() => setRoleFilter(role)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${roleFilter === role
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        {role === 'all' ? '📚 Semua' : role === 'user' ? '👤 Student' : role === 'instructor' ? '🎓 Instructor' : '👑 Admin'}
                        ({filteredUsers.filter(u => u.role === role || role === 'all').length})
                    </button>
                ))}
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">
                                User
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">
                                Email
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">
                                Role
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">
                                Kursus
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">
                                Enroll
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">

                                {/* User Info */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {user.image ? (
                                            <Image
                                                src={user.image}
                                                alt={user.name || 'User'}
                                                width={40}
                                                height={40}
                                                className="w-10 h-10 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                👤
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {user.name || 'No Name'}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {user.clerkId.substring(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Email */}
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-sm">
                                    {user.email || 'N/A'}
                                </td>

                                {/* Current Role */}
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin'
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                            : user.role === 'instructor'
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {user.role === 'admin' ? '👑 Admin' : user.role === 'instructor' ? '🎓 Instructor' : '👤 Student'}
                                    </span>
                                </td>

                                {/* Courses Count */}
                                <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300 font-semibold">
                                    {user._count.courses}
                                </td>

                                {/* Enrollments Count */}
                                <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300 font-semibold">
                                    {user._count.enrollments}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-center">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        disabled={updating === user.id}
                                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-semibold border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                                    >
                                        <option value="user">👤 Student</option>
                                        <option value="instructor">🎓 Instructor</option>
                                        <option value="admin">👑 Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-gray-600 dark:text-gray-400">
                        Tidak ada pengguna dengan role ini
                    </p>
                </div>
            )}
        </div>
    )
}
