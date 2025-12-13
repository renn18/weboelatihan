import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import { revalidatePath } from 'next/cache';// Import Prisma Client yang sudah kita buat

// Helper untuk memastikan data JSON yang masuk valid
interface CourseRequestBody {
  title: string;
  description?: string;
  price?: number;
  isPublished?: boolean;
}

/**
 * 1. CREATE (POST) - Membuat Kursus Baru
 * @param request Objek Request dari klien (mengandung body data)
 * @returns Response JSON
 */
export async function POST(request: Request) {
  try {
    // 1. Ambil data dari body request
    const body: CourseRequestBody = await request.json();
    const { title, description, price } = body;

    // 2. Validasi sederhana
    if (!title) {
      return NextResponse.json({ message: "Judul kursus harus diisi." }, { status: 400 });
    }

    // 3. Buat slug yang ramah URL (misal: "Belajar NextJS" -> "belajar-nextjs")
    const slug = title.toLowerCase().replace(/\s+/g, '-').slice(0, 50);

    // 4. Gunakan Prisma untuk membuat data baru
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        price: price ?? 0, // Default price 0 jika tidak ada
        slug,
        isPublished: false, // Default tidak langsung terbit
      },
    });

    revalidatePath('/dashboard');

    // 5. Kirim response sukses
    return NextResponse.json(newCourse, { status: 201 });

  } catch (error) {
    console.error('Error saat membuat kursus:', error);
    // Kirim response error internal
    return NextResponse.json({ message: "Gagal membuat kursus baru." }, { status: 500 });
  }
}

/**
 * 2. READ (GET) - Membaca Semua Kursus
 * @returns Response JSON array of courses
 */
export async function GET() {
  try {
    // Gunakan Prisma untuk mengambil semua data
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' }, // Urutkan dari yang terbaru
    });

    // Kirim response data
    return NextResponse.json(courses, { status: 200 });

  } catch (error) {
    console.error('Error saat mengambil kursus:', error);
    return NextResponse.json({ message: "Gagal mengambil daftar kursus." }, { status: 500 });
  }
}