'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SectionsClientProps {
    course: any
}

export default function SectionsClient({ course }: SectionsClientProps) {
    const router = useRouter()
    const [sections, setSections] = useState(course.sections)
    const [showSectionModal, setShowSectionModal] = useState(false)
    const [showLessonModal, setShowLessonModal] = useState(false)
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Section form
    const [sectionForm, setSectionForm] = useState({ title: '', description: '' })

    // Lesson form
    const [lessonForm, setLessonForm] = useState({
        title: '',
        description: '',
        videoUrl: '',
        duration: '',
        difficulty: 'beginner',
        objectives: '',
    })

    // Add Section
    const handleAddSection = async () => {
        if (!sectionForm.title.trim()) {
            alert('Judul bagian tidak boleh kosong')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: course.id,
                    ...sectionForm,
                }),
            })

            const data = await res.json()

            if (data.success) {
                setSections([...sections, { ...data.section, lessons: [] }])
                setSectionForm({ title: '', description: '' })
                setShowSectionModal(false)
                alert('✅ Bagian berhasil ditambahkan!')
            } else {
                alert('❌ Error: ' + data.error)
            }
        } catch (error) {
            console.error(error)
            alert('Error menambahkan bagian')
        } finally {
            setLoading(false)
        }
    }

    // Add Lesson
    const handleAddLesson = async () => {
        if (!activeSectionId) return
        if (!lessonForm.title.trim()) {
            alert('Judul pelajaran tidak boleh kosong')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sectionId: activeSectionId,
                    ...lessonForm,
                }),
            })

            const data = await res.json()

            if (data.success) {
                // Update sections state
                const updatedSections = sections.map((section: any) =>
                    section.id === activeSectionId
                        ? { ...section, lessons: [...section.lessons, data.lesson] }
                        : section
                )
                setSections(updatedSections)
                setLessonForm({
                    title: '',
                    description: '',
                    videoUrl: '',
                    duration: '',
                    difficulty: 'beginner',
                    objectives: '',
                })
                setShowLessonModal(false)
                alert('✅ Pelajaran berhasil ditambahkan!')
            } else {
                alert('❌ Error: ' + data.error)
            }
        } catch (error) {
            console.error(error)
            alert('Error menambahkan pelajaran')
        } finally {
            setLoading(false)
        }
    }

    // Delete Section
    const handleDeleteSection = async (sectionId: string) => {
        if (!confirm('Hapus bagian ini? (Semua pelajaran juga akan terhapus)')) return

        try {
            const res = await fetch(`/api/sections?id=${sectionId}`, {
                method: 'DELETE',
            })

            const data = await res.json()

            if (data.success) {
                setSections(sections.filter((s: any) => s.id !== sectionId))
                alert('✅ Bagian berhasil dihapus!')
            } else {
                alert('❌ Error: ' + data.error)
            }
        } catch (error) {
            console.error(error)
            alert('Error menghapus bagian')
        }
    }

    // Delete Lesson
    const handleDeleteLesson = async (lessonId: string, sectionId: string) => {
        if (!confirm('Hapus pelajaran ini?')) return

        try {
            const res = await fetch(`/api/lessons?id=${lessonId}`, {
                method: 'DELETE',
            })

            const data = await res.json()

            if (data.success) {
                const updatedSections = sections.map((section: any) =>
                    section.id === sectionId
                        ? { ...section, lessons: section.lessons.filter((l: any) => l.id !== lessonId) }
                        : section
                )
                setSections(updatedSections)
                alert('✅ Pelajaran berhasil dihapus!')
            } else {
                alert('❌ Error: ' + data.error)
            }
        } catch (error) {
            console.error(error)
            alert('Error menghapus pelajaran')
        }
    }

    return (
        <div className="space-y-8">

            {/* Sections List */}
            {sections.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Belum ada bagian
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Mulai dengan menambahkan bagian pertama untuk kursus Anda
                    </p>
                    <button
                        onClick={() => setShowSectionModal(true)}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl"
                    >
                        ➕ Tambah Bagian Pertama
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {sections.map((section: any, idx: number) => (
                        <div
                            key={section.id}
                            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 space-y-6"
                        >
                            {/* Section Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Bagian {idx + 1}: {section.title}
                                    </h3>
                                    {section.description && (
                                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                                            {section.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setActiveSectionId(section.id)
                                            setShowLessonModal(true)
                                        }}
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all"
                                    >
                                        ➕ Pelajaran
                                    </button>

                                    <button
                                        onClick={() => handleDeleteSection(section.id)}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {/* Lessons List */}
                            {section.lessons.length === 0 ? (
                                <div className="p-6 bg-gray-50/50 dark:bg-gray-700/20 rounded-xl text-center">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Belum ada pelajaran di bagian ini
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {section.lessons.map((lesson: any, lIdx: number) => (
                                        <div
                                            key={lesson.id}
                                            className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl flex items-center justify-between border border-blue-200/50 dark:border-blue-800/50"
                                        >
                                            <div className="flex-1">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {lIdx + 1}. {lesson.title}
                                                </div>
                                                {lesson.description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                                        {lesson.description}
                                                    </p>
                                                )}
                                                <div className="flex gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    {lesson.duration && <span>⏱️ {lesson.duration} menit</span>}
                                                    {lesson.difficulty && <span>📊 {lesson.difficulty}</span>}
                                                    {lesson.videoUrl && <span>🎬 Video ada</span>}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleDeleteLesson(lesson.id, section.id)}
                                                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-600 rounded-lg transition-all"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add More Section Button */}
                    <button
                        onClick={() => setShowSectionModal(true)}
                        className="w-full py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl text-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-all"
                    >
                        ➕ Tambah Bagian Baru
                    </button>
                </div>
            )}

            {/* ====== MODALS ====== */}

            {/* Add Section Modal */}
            {showSectionModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg space-y-6 p-8">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                            ➕ Tambah Bagian Baru
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Judul Bagian
                                </label>
                                <input
                                    type="text"
                                    placeholder="Misal: Dasar-Dasar Next.js"
                                    value={sectionForm.title}
                                    onChange={(e) =>
                                        setSectionForm({ ...sectionForm, title: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Deskripsi (Opsional)
                                </label>
                                <textarea
                                    placeholder="Jelaskan apa yang akan dipelajari di bagian ini..."
                                    value={sectionForm.description}
                                    onChange={(e) =>
                                        setSectionForm({ ...sectionForm, description: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white h-24 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowSectionModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                            >
                                Batalkan
                            </button>
                            <button
                                onClick={handleAddSection}
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    '✅ Simpan Bagian'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Lesson Modal */}
            {showLessonModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6 p-8">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                            ➕ Tambah Pelajaran
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Judul Pelajaran
                                </label>
                                <input
                                    type="text"
                                    placeholder="Misal: Apa itu Next.js?"
                                    value={lessonForm.title}
                                    onChange={(e) =>
                                        setLessonForm({ ...lessonForm, title: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Deskripsi
                                </label>
                                <textarea
                                    placeholder="Jelaskan konten pelajaran ini..."
                                    value={lessonForm.description}
                                    onChange={(e) =>
                                        setLessonForm({ ...lessonForm, description: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white h-24 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    URL Video YouTube
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={lessonForm.videoUrl}
                                    onChange={(e) =>
                                        setLessonForm({ ...lessonForm, videoUrl: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Durasi (menit)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="5"
                                        value={lessonForm.duration}
                                        onChange={(e) =>
                                            setLessonForm({ ...lessonForm, duration: e.target.value })
                                        }
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Level Kesulitan
                                    </label>
                                    <select
                                        value={lessonForm.difficulty}
                                        onChange={(e) =>
                                            setLessonForm({ ...lessonForm, difficulty: e.target.value })
                                        }
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="beginner">🟢 Beginner</option>
                                        <option value="intermediate">🟡 Intermediate</option>
                                        <option value="advanced">🔴 Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Tujuan Pembelajaran (satu per baris)
                                </label>
                                <textarea
                                    placeholder="Memahami konsep X&#10;Bisa membuat Y&#10;Menguasai Z"
                                    value={lessonForm.objectives}
                                    onChange={(e) =>
                                        setLessonForm({ ...lessonForm, objectives: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white h-24 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowLessonModal(false)
                                    setActiveSectionId(null)
                                }}
                                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                            >
                                Batalkan
                            </button>
                            <button
                                onClick={handleAddLesson}
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    '✅ Simpan Pelajaran'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
