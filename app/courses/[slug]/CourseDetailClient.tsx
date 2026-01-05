'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

interface CourseDetailClientProps {
    courseSlug: string
    price: number
    isEnrolled: boolean
    enrollmentStatus?: string
}

declare global {
    interface Window {
        snap: {
            pay: (token: string, options: any) => void
        }
    }
}

export default function CourseDetailClient({
    courseSlug,
    price,
    isEnrolled,
    enrollmentStatus,
}: CourseDetailClientProps) {
    const router = useRouter()
    const { user, isLoaded } = useUser()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Load Midtrans script
    useEffect(() => {
        if (price > 0) {
            const script = document.createElement('script')
            script.src = 'https://app.midtrans.com/snap/snap.js'
            script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')
            document.body.appendChild(script)

            return () => {
                document.body.removeChild(script)
            }
        }
    }, [price])

    const handleEnroll = async () => {
        // Check login
        if (!isLoaded) {
            setError('Loading...')
            return
        }

        if (!user) {
            router.push('/sign-in')
            return
        }

        // If already enrolled - redirect to learn
        if (isEnrolled) {
            router.push(`/learn/${courseSlug}`)
            return
        }

        setLoading(true)
        setError('')

        try {
            // Gratis course
            if (price === 0) {
                const res = await fetch('/api/enrollments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ courseSlug }),
                })

                const data = await res.json()

                if (data.success) {
                    alert('✅ Berhasil enroll kelas gratis!')
                    router.push(`/learn/${courseSlug}`)
                } else {
                    setError(data.error || 'Gagal enroll')
                }
            } else {
                // Berbayar - Midtrans
                const res = await fetch('/api/payments/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ courseSlug }),
                })

                const data = await res.json()

                if (data.success && data.transactionToken && window.snap) {
                    window.snap.pay(data.transactionToken, {
                        onSuccess: () => {
                            alert('✅ Pembayaran berhasil!')
                            router.push(`/learn/${courseSlug}`)
                        },
                        onPending: () => {
                            alert('⏳ Pembayaran pending')
                            setLoading(false)
                        },
                        onError: () => {
                            setError('❌ Pembayaran gagal')
                            setLoading(false)
                        },
                        onClose: () => {
                            setError('Pembayaran dibatalkan')
                            setLoading(false)
                        },
                    })
                } else {
                    setError(data.error || 'Gagal membuat transaksi')
                    setLoading(false)
                }
            }
        } catch (err) {
            setError('Network error')
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">

            {/* Price Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 space-y-4">

                {/* Price */}
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Harga</p>
                    <div className="text-4xl font-black text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                        {price === 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400">Gratis</span>
                        ) : (
                            `Rp ${price.toLocaleString('id-ID')}`
                        )}
                    </div>
                </div>

                {/* Status */}
                {isEnrolled && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50 rounded-xl">
                        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                            <span>✅</span>
                            Anda sudah terdaftar di kursus ini
                        </p>
                        {enrollmentStatus && (
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                                Status: <span className="font-bold">{enrollmentStatus}</span>
                            </p>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl">
                        <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                            {error}
                        </p>
                    </div>
                )}

                {/* Button */}
                <button
                    onClick={handleEnroll}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${isEnrolled
                        ? 'bg-emerald-600 text-white'
                        : price === 0
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                        }`}
                >
                    {loading && (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    <span>
                        {isEnrolled
                            ? '✅ Mulai Belajar'
                            : loading
                                ? 'Memproses...'
                                : price === 0
                                    ? '🚀 Ikuti Gratis'
                                    : '💳 Beli Sekarang'}
                    </span>
                </button>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="block font-bold mb-2">💡 Tip:</span>
                    {price === 0
                        ? 'Kursus ini gratis! Daftar sekarang dan mulai belajar tanpa pembayaran.'
                        : isEnrolled
                            ? 'Anda sudah terdaftar. Klik tombol di atas untuk mulai belajar.'
                            : 'Pembayaran aman melalui Midtrans. Dapatkan akses seumur hidup setelah pembelian.'}
                </p>
            </div>
        </div>
    )
}
