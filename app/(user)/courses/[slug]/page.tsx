'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Course {
    id: string
    title: string
    slug: string
    description: string | null
    price: number
    thumbnail: string | null
    user: { name: string | null }
}

export default function CourseDetail() {
    const params = useParams()
    const [course, setCourse] = useState<Course | null>(null)
    const [enrolled, setEnrolled] = useState(false)
    const [loading, setLoading] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Fetch course
        fetch(`/api/courses?slug=${params.slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setCourse(data.data)
            })
            .finally(() => setLoading(false))

        // Check enrollment
        if (params.courseId) {
            fetch(`/api/enrollments/check?courseId=${params.courseId}`)
                .then(res => res.json())
                .then(data => setEnrolled(data.enrolled))
        }
    }, [params.slug])

    const handleEnroll = async () => {
        if (!course) return

        setEnrolling(true)
        try {
            const endpoint = course.price === 0 ? '/api/enrollments' : '/api/payments/create'

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: course.id }),
            })

            const data = await res.json()

            if (data.success) {
                if (course.price === 0) {
                    // GRATIS - sukses
                    setEnrolled(true)
                    alert('✅ Berhasil enroll kelas gratis!')
                } else {
                    // BERBAYAR - Midtrans
                    if (data.transactionToken && window.snap) {
                        window.snap.pay(data.transactionToken, {
                            onSuccess: () => {
                                setEnrolled(true)
                                router.push('/my-courses')
                            },
                            onError: () => setEnrolling(false),
                        })
                    } else {
                        alert('Gagal buat transaksi')
                        setEnrolling(false)
                    }
                }
            } else {
                alert('Error: ' + data.message)
                setEnrolling(false)
            }
        } catch (error) {
            console.error(error)
            alert('Network error')
            setEnrolling(false)
        }
    }


    if (loading) return <div>Loading...</div>
    if (!course) return <div>Course not found</div>

    return (
        <div className="max-w-4xl mx-auto p-8">
            <Link href="/courses" className="text-blue-600 hover:underline mb-8 inline-block">
                ← Kembali ke kursus
            </Link>

            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <h1 className="text-4xl font-bold mb-6">{course.title}</h1>
                    <p className="text-xl text-gray-600 mb-8">{course.description}</p>

                    <div className="flex gap-4 items-center mb-8">
                        <div className="text-3xl font-bold">
                            {course.price === 0 ? 'Gratis' : `Rp ${course.price.toLocaleString()}`}
                        </div>

                        <button
                            onClick={handleEnroll}
                            disabled={enrolled || enrolling}
                            className={`
                px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl
                ${enrolled
                                    ? 'bg-green-500 cursor-not-allowed'
                                    : course.price === 0
                                        ? 'bg-emerald-500 hover:bg-emerald-600'
                                        : 'bg-blue-500 hover:bg-blue-600'
                                }
              `}
                        >
                            {enrolled ? '✅ Terdaftar' : enrolling ? 'Memproses...' : course.price === 0 ? 'Ikuti Gratis' : 'Beli Kelas'}
                        </button>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        oleh {course.user.name}
                    </div>
                </div>

                <div className="h-80 bg-gray-100 rounded-xl flex items-center justify-center">
                    {course.thumbnail ? (
                        <Image width={500} height={500} src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                        'Preview image'
                    )}
                </div>
            </div>
        </div>
    )
}
