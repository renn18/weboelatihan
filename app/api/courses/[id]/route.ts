// app/api/courses/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// Import yang benar untuk Clerk v6 Server Components/Route Handlers
import { auth, currentUser } from '@clerk/nextjs/server';

async function checkAdminStatus(): Promise<boolean> {
  const { userId } = await auth()
  if (!userId) return false

  const user = await currentUser()
  return user?.publicMetadata?.role === 'ADMIN'
}



// =================================================================
// 3. UPDATE (PUT/PATCH) - Memperbarui Kursus
// =================================================================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await checkAdminStatus()
  if (!isAdmin) {
    return NextResponse.json(
      { message: 'Akses ditolak. Anda bukan administrator.' },
      { status: 403 }
    )
  }

  const { id } = await params

  try {
    const body = await request.json()

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Gagal memperbarui kursus.' },
      { status: 500 }
    )
  }
}


// =================================================================
// 4. DELETE (DELETE) - Menghapus Kursus
// =================================================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await checkAdminStatus()
  if (!isAdmin) {
    return NextResponse.json(
      { message: 'Akses ditolak. Anda bukan administrator.' },
      { status: 403 }
    )
  }

  const { id } = await params

  try {
    await prisma.course.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Gagal menghapus kursus.' },
      { status: 500 }
    )
  }
}