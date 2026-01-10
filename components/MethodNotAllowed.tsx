'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MethodNotAllowedPage() {
    const router = useRouter()
    const [seconds, setSeconds] = useState(5)

    // Efek 1: countdown tiap 1 detik
    useEffect(() => {
        const intervalId = setInterval(() => {
            setSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(intervalId)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(intervalId)
    }, [])

    // Efek 2: redirect ketika seconds == 0
    useEffect(() => {
        if (seconds === 0) {
            router.push('/')  // aman: dipanggil dari useEffect, bukan dari render
        }
    }, [seconds, router])

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200/60 dark:border-gray-700/60 text-center">
                <div className="text-5xl mb-4">⛔</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    405 – Method Not Allowed
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Anda tidak memiliki izin untuk mengakses halaman admin ini.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                    Anda akan diarahkan ke halaman utama dalam{' '}
                    <span className="font-semibold text-red-500">{seconds}</span> detik.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                    Kembali ke Beranda
                </Link>
            </div>
        </main>
    )
}
