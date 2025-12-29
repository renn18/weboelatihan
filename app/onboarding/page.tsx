'use client'

import * as React from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from './_actions'
import { BookOpen } from 'lucide-react'

interface OnboardingData {
    applicationName: string;
    applicationType: string;
}


export default function OnboardingComponent() {
    const [error, setError] = React.useState<string>('')
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [isSuccess, setIsSuccess] = React.useState<boolean>(false)
    const { user } = useUser()
    const router = useRouter()


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isLoading) return

        setIsLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)

        const applicationName = formData.get('applicationName') as string
        const applicationType = formData.get('applicationType') as string

        // 1️⃣ VALIDASI DULU
        if (!applicationName || !applicationType) {
            setError('Mohon lengkapi semua bidang.')
            setIsLoading(false)
            return
        }

        // 2️⃣ PANGGIL SERVER ACTION
        const res = await completeOnboarding(formData)

        // 3️⃣ HANDLE ERROR DARI SERVER
        if ('error' in res) {
            setError(res.error)
            setIsLoading(false)
            return
        }

        // 4️⃣ SUCCESS FLOW
        setIsSuccess(true)

        // 5️⃣ RELOAD SESSION
        await user?.reload()

        // 6️⃣ REDIRECT SETELAH SESSION UPDATE
        router.replace('/dashboard')
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
                <div className="max-w-sm animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Berhasil!</h2>
                    <p className="text-slate-500">Data Anda telah disimpan. Mengalihkan ke Dashboard...</p>
                </div>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 selection:bg-indigo-100">
            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4 shadow-xl shadow-indigo-200 dark:shadow-none">
                        <BookOpen className="text-white" size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Selamat Datang
                    </h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Mari siapkan aplikasi Anda dalam beberapa langkah mudah.
                    </p>
                </div>

                {/* Card Form */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-8 transition-all">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Field: Application Name */}
                        <div className="space-y-2">
                            <label htmlFor="applicationName" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                Nama Lengkap
                            </label>
                            <input
                                id="applicationName"
                                type="text"
                                name="applicationName"
                                placeholder="Masukkan nama lengkap ..."
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                            <p className="text-xs text-slate-400 ml-1">
                                Nama ini akan muncul di dashboard dan email notifikasi.
                            </p>
                        </div>

                        {/* Field: Application Type */}
                        <div className="space-y-2">
                            <label htmlFor="applicationType" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                Tipe
                            </label>
                            <div className="relative">
                                <select
                                    id="applicationType"
                                    name="applicationType"
                                    required
                                    defaultValue=""
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Pilih Minat...</option>
                                    <option value="webdev">Web Development</option>
                                    <option value="iot">Internet of Thinking</option>
                                    <option value="softwareDev">Software Development</option>
                                    <option value="saas">SaaS / Software</option>
                                    <option value="other">Lainnya</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm animate-in slide-in-from-top-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memproses...
                                </>
                            ) : (
                                'Selesaikan Penyiapan'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer info */}
                <p className="mt-8 text-center text-sm text-slate-400">
                    Butuh bantuan? <a href="#" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Hubungi Tim Support</a>
                </p>
            </div>
        </div>
    )
}