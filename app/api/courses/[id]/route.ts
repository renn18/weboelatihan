import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteProps {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  try {
    const { id: courseId } = await params
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })

    if (!dbUser || dbUser.role !== 'instructor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course || course.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const { title,
      slug,
      description,
      price,
      thumbnail,
      category,
      isPublished, } =
      await request.json()

    // Check slug unique (exclude current course)
    if (slug && slug !== course.slug) {
      const existing = await prisma.course.findFirst({
        where: { slug },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Slug sudah digunakan' },
          { status: 400 }
        )
      }
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(thumbnail && { thumbnail }),
        ...(category && { category }),
        ...(isPublished !== undefined && { isPublished }), 
      },
    })

    console.log('✅ Course updated:', updatedCourse.id)

    return NextResponse.json({ success: true, course: updatedCourse })
  } catch (error: any) {
    console.error('❌ Course update error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to update course' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  try {
    const { id: courseId } = await params
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })

    if (!dbUser || dbUser.role !== 'instructor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course || course.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    await prisma.course.delete({
      where: { id: courseId },
    })

    console.log('✅ Course deleted:', courseId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Course delete error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to delete course' },
      { status: 500 }
    )
  }
}
