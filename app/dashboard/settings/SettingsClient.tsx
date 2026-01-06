'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

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

interface SettingsClientProps {
    user: User
}

export default function SettingsClient({ user }: SettingsClientProps) {
    const router = useRouter()
    const { user: clerkUser } = useUser()
    const [activeTab, setActiveTab] = useState<'profile' | 'role' | 'account' | 'security'>('profile')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleRoleChange = async (newRole: string) => {
        if (newRole === user.role) return

        if (!confirm(`Ubah role ke ${newRole}?`)) return

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const res = await fetch('/api/users/role', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Gagal mengubah role')
                return
            }

            setSuccess(`✅ Role berhasil diubah ke ${newRole}`)
            setTimeout(() => router.refresh(), 1500)
        } catch (err) {
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
                {[
                    { id: 'profile', label: '👤 Profil', icon: '👤' },
                    { id: 'role', label: '🎓 Role', icon: '🎓' },
                    { id: 'account', label: '🔐 Akun', icon: '🔐' },
                    { id: 'security', label: '🛡️ Keamanan', icon: '🛡️' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-3 font-semibold transition-all border-b-2 ${activeTab === tab.id
                            ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Error & Success Messages */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-200">{error}</p>
                </div>
            )}

            {success && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">{success}</p>
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="space-y-6">

                    {/* Profile Picture */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                📸 Foto Profil
                            </h2>
                            <div className="flex items-center gap-6">
                                {user.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name || 'User'}
                                        width={120}
                                        height={120}
                                        className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-5xl shadow-lg">
                                        👤
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Foto profil disinkronkan dari Clerk
                                    </p>
                                    <Link
                                        href="/user-profile"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                                    >
                                        <span>🔗</span>
                                        Edit di Clerk
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            ℹ️ Informasi Profil
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Nama Lengkap
                                </label>
                                <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-semibold">
                                    {user.name || 'Tidak diatur'}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                    Ubah melalui Clerk atau email kami
                                </p>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-semibold">
                                    {user.email || 'Tidak diatur'}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                    Email utama Anda
                                </p>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Role Saat Ini
                                </label>
                                <div className="px-4 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                                    <span className={`font-bold ${user.role === 'admin'
                                        ? 'text-purple-700 dark:text-purple-300'
                                        : user.role === 'instructor'
                                            ? 'text-blue-700 dark:text-blue-300'
                                            : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {user.role === 'admin' ? '👑 Admin' : user.role === 'instructor' ? '🎓 Instructor' : '👤 Student'}
                                    </span>
                                </div>
                            </div>

                            {/* Member Since */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Member Sejak
                                </label>
                                <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-semibold">
                                    {new Date(user.createdAt).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Courses Created */}
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                            <div className="text-5xl mb-4">📚</div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Kursus Dibuat</p>
                            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                                {user._count.courses}
                            </p>
                        </div>

                        {/* Courses Enrolled */}
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                            <div className="text-5xl mb-4">📖</div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Kursus Diikuti</p>
                            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                {user._count.enrollments}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Tab */}
            {activeTab === 'role' && (
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 space-y-6">

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        🎓 Ubah Role
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400">
                        Pilih role yang sesuai dengan kebutuhan Anda
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Student */}
                        <div className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${user.role === 'user'
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-400'
                            : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                            }`}>
                            <div className="text-4xl mb-4">👤</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Student
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Ikuti kursus dan tingkatkan skill Anda
                            </p>
                            <button
                                onClick={() => handleRoleChange('user')}
                                disabled={loading || user.role === 'user'}
                                className={`w-full py-2 rounded-lg font-semibold transition-all ${user.role === 'user'
                                    ? 'bg-blue-600 text-white cursor-default'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-blue-600 hover:text-white'
                                    }`}
                            >
                                {user.role === 'user' ? '✅ Role Saat Ini' : 'Pilih Role'}
                            </button>
                        </div>

                        {/* Instructor */}
                        <div className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${user.role === 'instructor'
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-400'
                            : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                            }`}>
                            <div className="text-4xl mb-4">🎓</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Instructor
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Buat kursus dan ajarkan siswa Anda
                            </p>
                            <button
                                onClick={() => handleRoleChange('instructor')}
                                disabled={loading || user.role === 'instructor'}
                                className={`w-full py-2 rounded-lg font-semibold transition-all ${user.role === 'instructor'
                                    ? 'bg-blue-600 text-white cursor-default'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-blue-600 hover:text-white'
                                    }`}
                            >
                                {user.role === 'instructor' ? '✅ Role Saat Ini' : 'Pilih Role'}
                            </button>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl">
                        <p className="text-sm text-blue-900 dark:text-blue-200">
                            <span className="font-bold">💡 Info:</span> Anda bisa mengubah role kapan saja. Sebagai instructor, Anda bisa membuat dan mengelola kursus.
                        </p>
                    </div>
                </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
                <div className="space-y-6">

                    {/* Connected Accounts */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 space-y-6">

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            🔗 Akun Terhubung
                        </h2>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">🔐</div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        Clerk Authentication
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {user.email || 'Email tidak diatur'}
                                    </p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-bold">
                                ✅ Terhubung
                            </span>
                        </div>
                    </div>

                    {/* Account Actions */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 space-y-4">

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            ⚡ Aksi Akun
                        </h2>

                        <Link
                            href="/user-profile"
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🔐</span>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        Edit Profil Clerk
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Kelola nama, email, dan sandi
                                    </p>
                                </div>
                            </div>
                            <span className="text-2xl">→</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="space-y-6">

                    {/* Password */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 space-y-4">

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            🔐 Keamanan Password
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400">
                            Kelola password dan keamanan akun Anda
                        </p>

                        <Link
                            href="/user-profile"
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🔒</span>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        Ubah Password
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Buat password yang kuat dan aman
                                    </p>
                                </div>
                            </div>
                            <span className="text-2xl">→</span>
                        </Link>
                    </div>

                    {/* Session */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 space-y-4">

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            🌐 Sesi Aktif
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400">
                            Logout dari semua sesi dan keluar
                        </p>


                    </div>

                    {/* Two-Factor */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 space-y-4">

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            🔑 Autentikasi Dua Faktor
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400">
                            Tingkatkan keamanan akun dengan 2FA
                        </p>

                        <Link
                            href="/user-profile"
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📱</span>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        Setup 2FA
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Gunakan authenticator app
                                    </p>
                                </div>
                            </div>
                            <span className="text-2xl">→</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
