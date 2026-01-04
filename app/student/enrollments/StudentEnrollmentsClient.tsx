'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Certificate {
    id: string
    certificateNumber: string
    verificationHash: string
    issuedAt: Date
    expiresAt?: Date | null
    status: string
    isVerified: boolean
}

interface Progress {
    id: string
    isCompleted: boolean
    completedAt?: Date | null
}

interface Enrollment {
    id: string
    courseId: string
    status: string
    progressPercentage: number
    createdAt: Date
    course: {
        id: string
        title: string
        slug: string
        thumbnail?: string | null
    }
    certificate?: Certificate | null
    progress: Progress[]
}

interface StudentEnrollmentsClientProps {
    enrollments: Enrollment[]
}

export default function StudentEnrollmentsClient({
    enrollments,
}: StudentEnrollmentsClientProps) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    // Generate certificate
    const handleGenerateCertificate = async (enrollmentId: string) => {
        if (!confirm('Generate certificate untuk kursus ini?')) {
            return
        }

        setLoading(enrollmentId)
        try {
            const res = await fetch('/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enrollmentId }),
            })

            const data = await res.json()

            if (data.success) {
                alert('✅ Sertifikat berhasil dibuat!')
                router.refresh()
            } else {
                alert('❌ Error: ' + data.error)
            }
        } catch (error) {
            console.error(error)
            alert('Error')
        } finally {
            setLoading(null)
        }
    }

    // Download certificate
    const handleDownloadCertificate = async (certificateId: string) => {
        try {
            const res = await fetch(`/api/certificates/${certificateId}/download`)

            if (!res.ok) {
                alert('❌ Failed to download certificate')
                return
            }

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `certificate-${Date.now()}.pdf`
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error(error)
            alert('Error downloading certificate')
        }
    }

    // Verify certificate
    const handleVerifyCertificate = async (certificate: Certificate) => {
        try {
            const res = await fetch(
                `/api/certificates?certificateNumber=${certificate.certificateNumber}`
            )

            const data = await res.json()

            if (data.success) {
                const cert = data.certificate

                alert(
                    `✅ Sertifikat Valid!\n\n` +
                    `Certificate #: ${cert.certificateNumber}\n` +
                    `Status: ${cert.status.toUpperCase()}\n` +
                    `Issued: ${new Date(cert.issuedAt).toLocaleDateString('id-ID')}\n` +
                    `Verified: ${cert.isVerified ? 'Yes' : 'No'}`
                )
            }
        } catch (error) {
            console.error(error)
            alert('❌ Failed to verify certificate')
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-purple-900 to-indigo-900 dark:from-purple-100 dark:to-indigo-100 bg-clip-text text-transparent mb-4">
                    📚 Kursus Saya
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                    {enrollments.length} kursus • Lihat progress dan kelola sertifikat Anda
                </p>
            </div>

            {/* Enrollments List */}
            {enrollments.length === 0 ? (
                <div className="text-center py-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Belum ada enrollment
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Jelajahi kursus yang tersedia dan daftar sekarang
                    </p>
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl"
                    >
                        <span>🔍</span>
                        Lihat Kursus
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map(enrollment => (
                        <div
                            key={enrollment.id}
                            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all"
                        >
                            {/* Course Thumbnail */}
                            <div className="relative h-40 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                                {enrollment.course.thumbnail ? (
                                    <Image
                                        width={400}
                                        height={160}
                                        src={enrollment.course.thumbnail}
                                        alt={enrollment.course.title}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">
                                        📚
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-3 right-3">
                                    <span
                                        className={`px-3 py-1 text-xs font-bold rounded-full ${enrollment.status === 'completed'
                                            ? 'bg-green-500/90 text-white'
                                            : enrollment.status === 'active'
                                                ? 'bg-blue-500/90 text-white'
                                                : 'bg-gray-500/90 text-white'
                                            }`}
                                    >
                                        {enrollment.status === 'completed'
                                            ? '✅ Completed'
                                            : enrollment.status === 'active'
                                                ? '📖 Active'
                                                : '❌ Cancelled'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                                    {enrollment.course.title}
                                </h3>

                                {/* Progress Bar */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Progress
                                        </span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            {enrollment.progressPercentage}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                                            style={{ width: `${enrollment.progressPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Enrollment Date */}
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    <p>
                                        📅 Enrolled:{' '}
                                        {new Date(enrollment.createdAt).toLocaleDateString('id-ID')}
                                    </p>
                                </div>

                                {/* Certificate Info */}
                                {enrollment.certificate && (
                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/50 rounded-lg space-y-2">
                                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                                            🎓 Sertifikat Dimiliki
                                        </p>

                                        {/* Certificate Number */}
                                        <div className="text-xs">
                                            <p className="text-yellow-800 dark:text-yellow-300 font-mono break-all">
                                                {enrollment.certificate.certificateNumber}
                                            </p>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-xs px-2 py-1 rounded font-semibold ${enrollment.certificate.status === 'active'
                                                    ? 'bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : enrollment.certificate.status === 'revoked'
                                                        ? 'bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                        : 'bg-orange-200 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                                    }`}
                                            >
                                                {enrollment.certificate.status === 'active'
                                                    ? '✅ Active'
                                                    : enrollment.certificate.status === 'revoked'
                                                        ? '❌ Revoked'
                                                        : '⏰ Expired'}
                                            </span>

                                            {enrollment.certificate.expiresAt && (
                                                <span className="text-xs text-yellow-700 dark:text-yellow-400">
                                                    📅{' '}
                                                    {new Date(
                                                        enrollment.certificate.expiresAt
                                                    ).toLocaleDateString('id-ID')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() =>
                                                    handleDownloadCertificate(enrollment.certificate!.id)
                                                }
                                                className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold text-sm transition-all"
                                            >
                                                📥 Download
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleVerifyCertificate(enrollment.certificate!)
                                                }
                                                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all"
                                            >
                                                ✓ Verify
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Main Actions */}
                                <div className="flex gap-2 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                                    <Link
                                        href={`/courses/${enrollment.course.slug}/learn`}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all text-center"
                                    >
                                        📖 Belajar
                                    </Link>

                                    {enrollment.progressPercentage === 100 &&
                                        !enrollment.certificate && (
                                            <button
                                                onClick={() =>
                                                    handleGenerateCertificate(enrollment.id)
                                                }
                                                disabled={loading === enrollment.id}
                                                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-all"
                                            >
                                                {loading === enrollment.id ? (
                                                    <span className="inline-flex items-center justify-center gap-1">
                                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    </span>
                                                ) : (
                                                    '🎓 Dapatkan Sertifikat'
                                                )}
                                            </button>
                                        )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
