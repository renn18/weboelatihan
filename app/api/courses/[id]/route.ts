// app/api/courses/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// Import yang benar untuk Clerk v6 Server Components/Route Handlers
import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * Fungsi Helper: Memeriksa apakah pengguna yang login adalah ADMIN
 * @returns {Promise<boolean>}
 */
async function checkAdminStatus(): Promise<boolean> {
  // Ambil sesi (userId) dari Clerk
  const { userId } = auth();

  // Jika tidak ada userId (belum login), kembalikan false
  if (!userId) {
    return false;
  }

  // Ambil user object lengkap (untuk mengakses metadata)
  const user = await currentUser();

  // Periksa Public Metadata. Asumsi Anda menyimpan role di publicMetadata.role
  const role = user?.publicMetadata?.role;

  // Cek apakah role adalah 'ADMIN'
  return role === 'ADMIN';
}


// =================================================================
// 3. UPDATE (PUT/PATCH) - Memperbarui Kursus
// =================================================================
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await checkAdminStatus();

  if (!isAdmin) {
    return NextResponse.json(
      { message: "Akses ditolak. Anda bukan administrator." },
      { status: 403 }
    );
  }

  const courseId = params.id;

  try {
    const body = await request.json();

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: body,
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Error saat memperbarui kursus:', error);
    return NextResponse.json(
      { message: "Gagal memperbarui kursus." },
      { status: 500 }
    );
  }
}


// =================================================================
// 4. DELETE (DELETE) - Menghapus Kursus
// =================================================================
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await checkAdminStatus();

  if (!isAdmin) {
    return NextResponse.json(
      { message: "Akses ditolak. Anda bukan administrator." },
      { status: 403 }
    );
  }

  try {
    await prisma.course.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error saat menghapus kursus:', error);
    return NextResponse.json(
      { message: "Gagal menghapus kursus." },
      { status: 500 }
    );
  }
}