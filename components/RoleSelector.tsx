'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RoleSelectorProps {
    currentRole: string
}

export default function RoleSelector({ currentRole }: RoleSelectorProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleRoleChange = async (newRole: string) => {
        if (newRole === currentRole) return

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/users/role', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to update role')
                return
            }

            alert(`✅ Role updated to ${newRole}`)
            router.refresh()
        } catch (err) {
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                    Pilih Role Anda:
                </label>
                <div className="flex flex-wrap gap-3">
                    {[
                        { value: 'user', label: '👤 Student', desc: 'Pelajar' },
                        { value: 'instructor', label: '🎓 Instructor', desc: 'Pembuat Kursus' },
                    ].map(role => (
                        <button
                            key={role.value}
                            onClick={() => handleRoleChange(role.value)}
                            disabled={loading}
                            className={`flex flex-col items-center gap-1 px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 ${currentRole === role.value
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500'
                                }`}
                        >
                            <span className="text-2xl">{role.label.split(' ')}</span>
                            <span className="text-sm">{role.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                        ❌ {error}
                    </p>
                </div>
            )}
        </div>
    )
}
