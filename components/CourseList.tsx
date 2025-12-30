import { prisma } from '@/lib/prisma';
import { Course } from '@/app/generated/prisma/client';

// 1. Fungsi Server untuk Mengambil Data
async function getCourses(): Promise<Course[]> {
    // Panggilan ke database menggunakan Prisma
    const courses = await prisma.course.findMany({
        orderBy: {
            createdAt: 'desc' // Urutkan dari yang terbaru
        },
    });
    return courses;
}

// 2. Server Component untuk Menampilkan Daftar
export default async function CourseList() {
    const courses = await getCourses();

    if (courses.length === 0) {
        return (
            <div className="text-center p-10 border border-gray-500 bg-none rounded-lg">
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-100">Tidak ada kursus yang ditemukan.</p>
                <p className="text-gray-500 mt-2">Silakan buat kursus baru menggunakan formulir di atas.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
                <div
                    key={course.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                    <div className="p-5">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 line-clamp-2">{course.title}</h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-100 line-clamp-3">
                            {course.description || "Tidak ada deskripsi tersedia."}
                        </p>
                    </div>

                    <div className="px-5 py-4 border-t bg-gray-50 dark:bg-gray-600 flex justify-between items-center">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${course.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {course.isPublished ? 'Terbit' : 'Draf'}
                        </span>


                        {course.price === 0 ?
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                Gratis
                            </span> :
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {/* Format harga ke Rupiah */}
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0
                                }).format(course.price)}
                            </span>
                        }
                    </div>
                </div>
            ))}
        </div>
    );
}