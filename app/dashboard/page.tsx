import CourseForm from '@/components/CourseForm'; // Import form yang sudah dibuat
import CourseList from '@/components/CourseList';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Ini adalah Server Component (default di App Router)
export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    // 3. (Opsional) Cek role jika Anda ingin hanya admin yang bisa mengakses
    // if (session.user?.role !== "ADMIN") { ... }

    return (
        <div className="p-8 space-y-12">
            <h1 className="text-4xl font-extrabold mb-8 text-center">Dashboard Admin</h1>

            {/* Komponen formulir Client Side */}
            <CourseForm />

            <hr className="border-gray-300" />

            {/* 2. Komponen Server untuk Menampilkan Data (Langsung dari DB) */}
            <section>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Daftar Kursus Saat Ini</h2>

                {/* CourseList adalah Server Component yang mengambil data */}
                <CourseList />

            </section>
        </div>
    );
}