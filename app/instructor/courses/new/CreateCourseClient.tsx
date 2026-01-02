'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CreateCourseClientProps {
    course?: any
    userId: string
}

export default function CreateCourseClient({ course, userId }: CreateCourseClientProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        title: course?.title || '',
        slug: course?.slug || '',
        description: course?.description || '',
        price: course?.price || 0,
        thumbnail: course?.thumbnail || '',
        category: course?.category || '',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Generate slug dari title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
    }

    const handleTitleChange = (value: string) => {
        setForm({
            ...form,
            title: value,
            slug: generateSlug(value),
        })
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!form.title.trim()) newErrors.title = 'Judul kursus wajib diisi'
        if (!form.slug.trim()) newErrors.slug = 'Slug wajib diisi'
        if (!form.description.trim()) newErrors.description = 'Deskripsi wajib diisi'
        if (form.price < 0) newErrors.price = 'Harga tidak boleh negatif'
        if (!form.category.trim()) newErrors.category = 'Kategori wajib diisi'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            alert('❌ Mohon isi semua field yang wajib')
            return
        }

        setLoading(true)
        try {
            const endpoint = course ? `/api/courses/${course.id}` : '/api/courses'
            const method = course ? 'PUT' : 'POST'

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })

            const data = await res.json()

            if (data.success) {
                alert(course ? '✅ Kursus berhasil diperbarui!' : '✅ Kursus berhasil dibuat!')

                // Navigate ke sections page
                const courseId = data.course?.id || course?.id
                router.push(`/instructor/courses/${courseId}/sections`)
            } else {
                alert('❌ Error: ' + (data.error || 'Gagal menyimpan kursus'))
            }
        } catch (error) {
            console.error(error)
            alert('❌ Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">

            {/* Form Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 space-y-8">

                {/* Title */}
                <div>
                    <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                        📚 Judul Kursus <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Misal: Next.js untuk Pemula"
                        value={form.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-lg dark:bg-gray-700 dark:text-white ${errors.title
                                ? 'border-red-500 focus:border-red-600'
                                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500'
                            }`}
                    />
                    {errors.title && (
                        <p className="text-red-500 text-sm mt-2 font-semibold">⚠️ {errors.title}</p>
                    )}
                </div>

                {/* Slug */}
                <div>
                    <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                        🔗 Slug (URL) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                        <span className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-400 font-medium">
                            /courses/
                        </span>
                        <input
                            type="text"
                            placeholder="nextjs-untuk-pemula"
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            className={`flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors dark:bg-gray-700 dark:text-white ${errors.slug
                                    ? 'border-red-500 focus:border-red-600'
                                    : 'border-gray-200 dark:border-gray-600 focus:border-blue-500'
                                }`}
                        />
                    </div>
                    {errors.slug && (
                        <p className="text-red-500 text-sm mt-2 font-semibold">⚠️ {errors.slug}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                        📝 Deskripsi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        placeholder="Jelaskan apa yang akan dipelajari, siapa target siswa, dan apa yang bisa dicapai setelah kursus selesai..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors resize-none h-32 dark:bg-gray-700 dark:text-white ${errors.description
                                ? 'border-red-500 focus:border-red-600'
                                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500'
                            }`}
                    />
                    {errors.description && (
                        <p className="text-red-500 text-sm mt-2 font-semibold">⚠️ {errors.description}</p>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                        🏷️ Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors dark:bg-gray-700 dark:text-white ${errors.category
                                ? 'border-red-500 focus:border-red-600'
                                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500'
                            }`}
                    >
                        <option value="">Pilih Kategori</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Design">Design</option>
                        <option value="Business">Business</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                    {errors.category && (
                        <p className="text-red-500 text-sm mt-2 font-semibold">⚠️ {errors.category}</p>
                    )}
                </div>

                {/* Price */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                            💰 Harga (Rp) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            placeholder="0 untuk gratis"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors dark:bg-gray-700 dark:text-white ${errors.price
                                    ? 'border-red-500 focus:border-red-600'
                                    : 'border-gray-200 dark:border-gray-600 focus:border-blue-500'
                                }`}
                        />
                        {errors.price && (
                            <p className="text-red-500 text-sm mt-2 font-semibold">⚠️ {errors.price}</p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            💡 Masukkan 0 untuk kursus gratis
                        </p>
                    </div>

                    {/* Thumbnail URL */}
                    <div>
                        <label className="block text-lg font-bold text-gray-900 dark:text-white mb-3">
                            🖼️ URL Thumbnail
                        </label>
                        <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={form.thumbnail}
                            onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none transition-colors dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            💡 Opsional: URL gambar cover kursus
                        </p>
                    </div>
                </div>

                {/* Thumbnail Preview */}
                {form.thumbnail && (
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                            📸 Preview Thumbnail
                        </p>
                        <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                            <img
                                src={form.thumbnail}
                                alt="Thumbnail preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <Link
                    href="/instructor/dashboard"
                    className="flex-1 px-8 py-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                >
                    ← Batalkan
                </Link>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Menyimpan...
                        </>
                    ) : course ? (
                        '✏️ Perbarui Kursus'
                    ) : (
                        '➕ Buat Kursus'
                    )}
                </button>
            </div>

            {/* Info */}
            <div className="p-6 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl">
                <p className="text-blue-900 dark:text-blue-200 text-sm">
                    💡 <span className="font-semibold">Tip:</span> Setelah membuat kursus, Anda bisa menambahkan bagian (section) dan pelajaran (lesson). Pastikan semua informasi sudah benar sebelum dipublikasikan.
                </p>
            </div>
        </form>
    )
}
