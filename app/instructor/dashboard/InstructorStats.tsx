'use client'

interface StatsProps {
    stats: {
        totalCourses: number
        totalStudents: number
        totalLessons: number
        activeCourses: number
    }
}

export default function InstructorStats({ stats }: StatsProps) {
    const statCards = [
        {
            label: 'Kursus',
            value: stats.totalCourses,
            icon: '📚',
            color: 'from-blue-500 to-indigo-600',
        },
        {
            label: 'Siswa Aktif',
            value: stats.totalStudents,
            icon: '👥',
            color: 'from-emerald-500 to-teal-600',
        },
        {
            label: 'Pelajaran',
            value: stats.totalLessons,
            icon: '📖',
            color: 'from-purple-500 to-pink-600',
        },
        {
            label: 'Dipublikasi',
            value: stats.activeCourses,
            icon: '✅',
            color: 'from-orange-500 to-red-600',
        },
    ]

    return (
        <div className="grid md:grid-cols-4 gap-6 mb-16">
            {statCards.map((stat, idx) => (
                <div
                    key={idx}
                    className={`bg-gradient-to-r ${stat.color} p-8 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 text-white group cursor-pointer overflow-hidden relative`}
                >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-4xl group-hover:scale-125 transition-transform duration-300">
                                {stat.icon}
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <span className="text-sm font-bold">↗</span>
                            </div>
                        </div>
                        <div className="text-4xl font-black mb-2 drop-shadow-lg">{stat.value}</div>
                        <div className="text-lg font-semibold opacity-90">{stat.label}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}
