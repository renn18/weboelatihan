'use client'

import { useTransition } from 'react'
import { useEffect, useState } from 'react'
import { enrollCourse, enrollAndPay } from '@/app/courses/[slug]/action'

interface EnrollButtonProps {
    courseId: string
    price: number
    initialStatus: 'idle' | 'enrolled' | null
}

export function EnrollButton({
    courseId,
    price,
    initialStatus
}: EnrollButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState<'idle' | 'enrolled' | 'loading'>(
        initialStatus === 'enrolled' ? 'enrolled' : 'idle'
    )

    const handleClick = () => {
        startTransition(async () => {
            setStatus('loading')

            try {
                if (price === 0) {
                    // GRATIS - langsung enrollCourse()
                    await enrollCourse(courseId)
                    setStatus('enrolled')
                } else {
                    // BERBAYAR - enrollAndPay()
                    const result = await enrollAndPay(courseId)

                    if (typeof window !== 'undefined' && window.snap) {
                        window.snap.pay(result.transactionToken, {
                            onSuccess: () => {
                                setStatus('enrolled')
                                window.location.href = '/dashboard'
                            },
                            onPending: () => setStatus('loading'),
                            onError: () => setStatus('idle'),
                            onClose: () => setStatus('idle'),
                        })
                    } else {
                        console.error('Snap.js not loaded')
                        setStatus('idle')
                        alert('Snap.js belum siap. Refresh halaman dan coba lagi.')
                    }
                }
            } catch (error: any) {
                console.error('Enroll error:', error)
                setStatus('idle')
                alert(`Gagal: ${error.message}`)
            }
        })
    }

    if (status === 'enrolled') {
        return (
            <button
                disabled
                className="px-8 py-3 bg-green-100 hover:bg-green-200 text-green-800 border-2 border-green-300 rounded-xl font-semibold shadow-md min-w-[160px] flex items-center justify-center gap-2"
            >
                ✅ Terdaftar
            </button>
        )
    }

    return (
        <button
            onClick={handleClick}
            disabled={isPending || status === 'loading'}
            className={`
        px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 min-w-[180px] flex items-center justify-center gap-2
        ${price === 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                }
        ${isPending || status === 'loading'
                    ? 'opacity-75 cursor-not-allowed scale-[0.98]'
                    : 'active:scale-[0.98]'
                }
      `}
        >
            {isPending || status === 'loading' ? (
                <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Memproses...
                </>
            ) : price === 0 ? (
                '🎓 Ikuti Gratis'
            ) : (
                '🛒 Beli Kelas'
            )}
        </button>
    )
}
