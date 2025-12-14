import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Tipe untuk parameter rute dinamis (Next.js memberikannya di params)
interface Context {
  params: { id: string };
}

/**
 * 3. UPDATE (PUT/PATCH) - Memperbarui Kursus
 */
export async function PUT(request: NextRequest, context: Context) {
  const courseId = context.params.id;

  try {
    const body = await request.json();
    // Kita hanya mengizinkan perubahan pada title, description, price, dan isPublished
    const { title, description, price, isPublished } = body;

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        price: price !== undefined ? price : undefined, // Hanya update jika ada
        isPublished: isPublished !== undefined ? isPublished : undefined,
        // Slug bisa dihitung ulang jika title berubah
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
 */
export async function DELETE(request: NextRequest, context: Context) {
  const courseId = context.params.id;

  try {
    await prisma.course.delete({
      where: { id: courseId },
    });

    // 204 No Content adalah status standar untuk operasi DELETE yang sukses
    return new NextResponse(null, { status: 204 }); 

  } catch (error) {
    console.error('Error saat menghapus kursus:', error);
    return NextResponse.json({ message: "Gagal menghapus kursus." }, { status: 500 });
  }
}