'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface LearningClientProps {
    course: any
    enrollment: any
    userId: string
}

export default function LearningClient({
    course,
    enrollment,
    userId,
}: LearningClientProps) {
    const router = useRouter()
    const [currentLesson, setCurrentLesson] = useState(
        enrollment.progress[0]?.lesson || course.sections[0]?.lessons[0]
    )
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [markingComplete, setMarkingComplete] = useState(false)
    const [showNotes, setShowNotes] = useState(false)
    const [notes, setNotes] = useState('')

    // Calculate stats
    const allLessons = course.sections.flatMap((s: any) => s.lessons)
    const totalLessons = allLessons.length
    const completedLessons = enrollment.progress.filter((p: any) => p.isCompleted).length
    const progress = Math.round((completedLessons / totalLessons) * 100)

    // Find current lesson index
    const currentLessonIndex = allLessons.findIndex((l: any) => l.id === currentLesson?.id)
    const nextLesson = allLessons[currentLessonIndex + 1]
    const prevLesson = allLessons[currentLessonIndex - 1]

    // Keyboard shortcuts
    useKeyboardShortcuts({
        'ArrowRight': () => nextLesson && setCurrentLesson(nextLesson),
        'ArrowLeft': () => prevLesson && setCurrentLesson(prevLesson),
        'n': () => setShowNotes(!showNotes),
        'c': () => !isLessonCompleted() && handleLessonComplete(),
    })

    const isLessonCompleted = () => {
        return enrollment.progress.some(
            (p: any) => p.lessonId === currentLesson.id && p.isCompleted
        )
    }

    const handleLessonComplete = async () => {
        setMarkingComplete(true)
        try {
            const res = await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enrollmentId: enrollment.id,
                    lessonId: currentLesson.id,
                }),
            })

            if (res.ok) {
                // Optimistic update
                setCurrentLesson(prev => ({ ...prev, completed: true }))

                // Auto navigate ke next lesson
                if (nextLesson && progress < 99) {
                    setTimeout(() => {
                        setCurrentLesson(nextLesson)
                    }, 500)
                }

                router.refresh()
            }
        } catch (error) {
            console.error(error)
            alert('Gagal menandai selesai')
        } finally {
            setMarkingComplete(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 flex">

            {/* ====== SIDEBAR ====== */}
            <div
                className={`${sidebarOpen ? 'w-96' : 'w-0'
                    } bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 overflow-y-auto transition-all duration-300 shadow-2xl fixed h-screen z-40 md:relative`}
            >
                <div className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-6 z-20">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                            {course.title}
                        </h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                            title="Tutup sidebar (Esc)"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 dark:text-white">Progress</span>
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{progress}%</span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 transition-all duration-700 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                            <span>{completedLessons} pelajaran selesai</span>
                            <span>{totalLessons} total</span>
                        </div>

                        {/* Motivational message */}
                        {progress === 100 ? (
                            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 text-center mt-2">
                                🎉 Selamat! Kursus selesai!
                            </div>
                        ) : (
                            <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                {totalLessons - completedLessons} pelajaran lagi
                            </div>
                        )}
                    </div>

                    {/* Instructor Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-100/50 dark:bg-gray-700/30 rounded-xl mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                            {course.user?.image ? (
                                <Image
                                    src={course.user.image}
                                    alt={course.user.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full w-full h-full object-cover"
                                />
                            ) : (
                                <span className="font-bold text-white text-sm">
                                    {course.user?.name?.[0]}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Instruktur</div>
                            <div className="font-bold text-gray-900 dark:text-white truncate">
                                {course.user?.name}
                            </div>
                        </div>
                    </div>

                    {/* Keyboard Shortcuts Hint */}
                    <div className="text-xs text-gray-500 dark:text-gray-500 p-2 bg-gray-50/50 dark:bg-gray-700/20 rounded-lg mb-4 space-y-1">
                        <div>⌨️ <span className="font-mono">← →</span> navigasi pelajaran</div>
                        <div>⌨️ <span className="font-mono">C</span> tandai selesai</div>
                        <div>⌨️ <span className="font-mono">N</span> buka catatan</div>
                    </div>
                </div>

                {/* Sections & Lessons List */}
                <div className="p-6 space-y-4">
                    {course.sections.map((section: any, sIdx: number) => (
                        <div key={section.id} className="space-y-2">
                            <div className="font-bold text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider px-4 py-2">
                                Bagian {sIdx + 1}: {section.title}
                            </div>

                            {section.lessons.map((lesson: any, lIdx: number) => {
                                const isCompleted = enrollment.progress.some(
                                    (p: any) => p.lessonId === lesson.id && p.isCompleted
                                )
                                const isActive = currentLesson?.id === lesson.id

                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => {
                                            setCurrentLesson(lesson)
                                            if (window.innerWidth < 768) {
                                                setSidebarOpen(false)
                                            }
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-medium group ${isActive
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`text-lg ${isActive ? 'group-hover:scale-110' : ''} transition-transform`}>
                                                {isCompleted ? '✅' : `${lIdx + 1}`}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="line-clamp-2 text-sm font-semibold">
                                                    {lesson.title}
                                                </div>
                                                {lesson.duration && (
                                                    <div className={`text-xs mt-1 ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                                                        ⏱️ {lesson.duration} menit
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* ====== MAIN CONTENT ====== */}
            <div className="flex-1 flex flex-col">

                {/* Top Navigation Bar */}
                <div className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 flex items-center justify-between shadow-lg z-30">

                    {/* Toggle Sidebar */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                        title={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
                    >
                        {sidebarOpen ? '◀️' : '▶️'}
                    </button>

                    {/* Lesson Title */}
                    <div className="flex-1 mx-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                            {currentLesson?.title || 'Pilih pelajaran'}
                        </h3>
                        {currentLessonIndex >= 0 && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Pelajaran {currentLessonIndex + 1} dari {totalLessons}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowNotes(!showNotes)}
                            className={`p-3 rounded-lg transition-all ${showNotes
                                    ? 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100'
                                }`}
                            title="Catatan (N)"
                        >
                            📝
                        </button>

                        <Link
                            href="/my-courses"
                            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all hover:-translate-y-1"
                            title="Kembali ke dashboard"
                        >
                            ← Kembali
                        </Link>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {currentLesson ? (
                        <div className="max-w-4xl mx-auto space-y-8">

                            {/* Video Player */}
                            {currentLesson.videoUrl ? (
                                <div className="group">
                                    <div className="aspect-video bg-gray-900 rounded-3xl shadow-2xl overflow-hidden relative">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${extractYouTubeId(
                                                currentLesson.videoUrl
                                            )}?rel=0&modestbranding=1`}
                                            title={currentLesson.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                        />
                                    </div>
                                    <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            💡 <span className="font-semibold">Tip:</span> Gunakan keyboard arrow keys untuk navigasi pelajaran
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center shadow-2xl">
                                    <span className="text-6xl">🎬</span>
                                </div>
                            )}

                            {/* Lesson Content */}
                            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 space-y-6">

                                <div>
                                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                        {currentLesson.title}
                                    </h2>

                                    <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-6">
                                        {currentLesson.duration && (
                                            <span className="flex items-center gap-2">
                                                ⏱️ {currentLesson.duration} menit
                                            </span>
                                        )}
                                        {currentLesson.difficulty && (
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${currentLesson.difficulty === 'advanced'
                                                    ? 'bg-red-100/50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                    : currentLesson.difficulty === 'intermediate'
                                                        ? 'bg-yellow-100/50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                        : 'bg-green-100/50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                }`}>
                                                {currentLesson.difficulty === 'advanced' ? '🔴 Advanced' : currentLesson.difficulty === 'intermediate' ? '🟡 Intermediate' : '🟢 Beginner'}
                                            </span>
                                        )}
                                        {isLessonCompleted() && (
                                            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-sm font-semibold">
                                                ✅ Selesai
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                {currentLesson.description && (
                                    <div className="prose dark:prose-invert max-w-none">
                                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            {currentLesson.description}
                                        </p>
                                    </div>
                                )}

                                {/* Learning Objectives */}
                                {currentLesson.objectives && (
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-3">📚 Tujuan Pembelajaran:</h4>
                                        <ul className="space-y-2">
                                            {(typeof currentLesson.objectives === 'string'
                                                ? currentLesson.objectives.split('\n')
                                                : currentLesson.objectives
                                            ).map((obj: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                                    <span className="text-lg flex-shrink-0 mt-0.5">✓</span>
                                                    <span>{obj}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Mark Complete Button */}
                                <div className="pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                                    {!isLessonCompleted() ? (
                                        <button
                                            onClick={handleLessonComplete}
                                            disabled={markingComplete}
                                            className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3"
                                        >
                                            {markingComplete ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Memproses...
                                                </>
                                            ) : (
                                                <>
                                                    ✅ Tandai Selesai
                                                    <span className="text-sm opacity-75">(C)</span>
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="w-full px-8 py-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-2xl font-bold flex items-center justify-center gap-3 text-lg">
                                            <span className="text-2xl">✅</span>
                                            Sudah diselesaikan!
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex gap-4 justify-between pt-4">
                                {prevLesson ? (
                                    <button
                                        onClick={() => setCurrentLesson(prevLesson)}
                                        className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all hover:-translate-y-1 flex items-center gap-2"
                                    >
                                        <span>← Pelajaran Sebelumnya</span>
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {nextLesson && (
                                    <button
                                        onClick={() => setCurrentLesson(nextLesson)}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2"
                                    >
                                        <span>Pelajaran Selanjutnya →</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center space-y-6">
                                <div className="text-6xl">📚</div>
                                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                    Pilih pelajaran dari sidebar untuk memulai
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ====== NOTES MODAL ====== */}
            {showNotes && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">

                        {/* Header */}
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-600 dark:to-orange-600 px-8 py-6 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-white">📝 Catatan Pelajaran</h3>
                            <button
                                onClick={() => setShowNotes(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Tulis catatan Anda di sini..."
                                className="w-full h-full min-h-96 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-yellow-400 focus:outline-none resize-none dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-100 dark:bg-gray-700 px-8 py-4 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowNotes(false)}
                                className="px-6 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => {
                                    // Save notes logic (bisa pakai API)
                                    setShowNotes(false)
                                }}
                                className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:-translate-y-1"
                            >
                                💾 Simpan Catatan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Helper function
function extractYouTubeId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : ''
}
