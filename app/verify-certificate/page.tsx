'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function VerifyCertificatePage() {
    const [certificateNumber, setCertificateNumber] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState('')

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setResult(null)

        try {
            const res = await fetch(
                `/api/certificates?certificateNumber=${certificateNumber.trim()}`
            )

            const data = await res.json()

            if (data.success) {
                const cert = data.certificate
                setResult({
                    studentName: cert.user.name,
                    courseName: cert.course.title,
                    instructorName: cert.course.user.name,
                    certificateNumber: cert.certificateNumber,
                    issuedDate: new Date(cert.issuedAt).toLocaleDateString('id-ID'),
                    status: cert.status,
                    isVerified: cert.isVerified,
                    isValid: cert.isValid,
                    expiresAt: cert.expiresAt
                        ? new Date(cert.expiresAt).toLocaleDateString('id-ID')
                        : null,
                })
            } else {
                setError(data.error || 'Certificate not found')
            }
        } catch (err) {
            console.error(err)
            setError('Error verifying certificate')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black bg-gradient-to-r from-purple-900 to-indigo-900 dark:from-purple-100 dark:to-indigo-100 bg-clip-text text-transparent mb-4">
                        🎓 Verify Certificate
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Verify the authenticity of a certificate
                    </p>
                </div>

                {/* Verify Form */}
                <form
                    onSubmit={handleVerify}
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 space-y-6 mb-8"
                >
                    <div>
                        <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                            Certificate Number
                        </label>
                        <input
                            type="text"
                            placeholder="Enter certificate number..."
                            value={certificateNumber}
                            onChange={(e) => setCertificateNumber(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white text-lg"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            '✓ Verify Certificate'
                        )}
                    </button>
                </form>

                {/* Error */}
                {error && (
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl mb-8">
                        <p className="text-red-900 dark:text-red-200 font-semibold">
                            ❌ {error}
                        </p>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 space-y-6">
                        {/* Status */}
                        <div
                            className={`p-4 rounded-xl text-center font-bold text-lg ${result.isValid
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200'
                                }`}
                        >
                            {result.isValid
                                ? '✅ CERTIFICATE IS VALID'
                                : '❌ CERTIFICATE IS INVALID'}
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                    Student Name
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {result.studentName}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                    Course
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {result.courseName}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                    Instructor
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {result.instructorName}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                    Issued Date
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {result.issuedDate}
                                </p>
                            </div>

                            {result.expiresAt && (
                                <div>
                                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                        Expires
                                    </p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {result.expiresAt}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                    Certificate Number
                                </p>
                                <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                                    {result.certificateNumber}
                                </p>
                            </div>
                        </div>

                        {/* Back Button */}
                        <Link
                            href="/"
                            className="block w-full text-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
