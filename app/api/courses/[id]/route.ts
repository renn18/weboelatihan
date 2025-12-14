import { NextRequest, NextResponse } from 'next/server'; // <-- Import NextRequest
import prisma from '@/lib/prisma'; 

// DEFINISIKAN ULANG CONTEXT
// Next.js App Router menyediakan params sebagai Promise
interface Context {
  params: Promise<{ id: string }>;
}

/**
 * 3. UPDATE (PUT/PATCH) - Memperbarui Kursus
 * Gunakan NextRequest dan tipe Context yang sudah diperbaiki
 */
export async function PUT(request: NextRequest, context: Context) {
  const { id: courseId } = await context.params; // Await params Promise

  try {
    const body = await request.json();
    const { title, description, price, isPublished } = body;

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        price: price !== undefined ? price : undefined,
        isPublished: isPublished !== undefined ? isPublished : undefined,
      },
    });

    return NextResponse.json(updatedCourse, { status: 200 });

  } catch (error) {
    console.error('Error saat memperbarui kursus:', error);
    return NextResponse.json({ message: "Gagal memperbarui kursus." }, { status: 500 });
  }
}

/**
 * 4. DELETE (DELETE) - Menghapus Kursus
 * Gunakan NextRequest dan tipe Context yang sudah diperbaiki
 */
export async function DELETE(request: NextRequest, context: Context) {
  const { id: courseId } = await context.params;

  try {
    await prisma.course.delete({
      where: { id: courseId },
    });

    return new NextResponse(null, { status: 204 }); 

  } catch (error) {
    console.error('Error saat menghapus kursus:', error);
    return NextResponse.json({ message: "Gagal menghapus kursus." }, { status: 500 });
  }
}

// (Jika Anda juga memiliki GET untuk detail kursus di sini, tambahkan)
// export async function GET(request: NextRequest, context: Context) {
//   const courseId = context.params.id;
//   // ... logika read single course
// }