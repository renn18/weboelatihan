
interface Course {
    id: string
    title: string
    slug: string
    price: number
    thumbnail: string | null
    description?: string
    category?: string
}

interface CoursesFilterProps {
    categories: string[]
    courses: Course[]
}

export default function CoursesFilter({ categories, courses }: CoursesFilterProps) {
    return (
        <div className="mb-12 space-y-8">

            {/* Search Form */}
            <form method="get" className="flex gap-4">
                <div className="flex-1 relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                        🔍
                    </div>
                    <input
                        type="text"
                        name="search"
                        placeholder="Cari kursus..."
                        defaultValue=""
                        className="w-full pl-12 pr-6 py-4 text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:outline-none dark:text-white transition-all shadow-lg hover:shadow-xl"
                    />
                </div>
                <button
                    type="submit"
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                    Cari
                </button>
            </form>

            {/* Category Filter */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    📂 Kategori
                </h2>
                <div className="flex flex-wrap gap-3">
                    {categories.map(category => (
                        <CategoryButton
                            key={category}
                            category={category}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function CategoryButton({ category }: { category: string }) {
    const label = category === 'all' ? '🏠 Semua' : category

    return (
        <form method="get" className="inline">
            <input type="hidden" name="category" value={category} />
            <button
                type="submit"
                className="px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:border-transparent"
            >
                {label}
            </button>
        </form>
    )
}
