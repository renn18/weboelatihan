import { prisma } from "@/lib/prisma"; // Sesuaikan path
import { Course } from "./generated/prisma/client";

// Karena ini adalah Server Component, kita bisa menggunakan async/await
async function getPublishedCourses() {
  const courses = await prisma.course.findMany({
    where: {
      isPublished: false,
    },
    // Urutkan berdasarkan tanggal dibuat terbaru
    orderBy: {
      createdAt: "desc",
    },
  });
  return courses;
}

export default async function HomePage() {
  // Panggilan ke database dilakukan di sisi server
  const courses = await getPublishedCourses();

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Daftar Kursus Terbaru</h1>

      {courses.length === 0 ? (
        <p>Belum ada kursus yang diterbitkan.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course: Course) => (
            <div key={course.id} className="border p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p className="text-gray-600 mt-2">{course.description}</p>
              <p className="font-bold mt-4">Harga: Rp{course.price.toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}