import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      sectionId,
      title,
      description,
      videoUrl,
      duration,
      difficulty,
      objectives,
    } = await request.json()

    if (!sectionId || !title) {
      return NextResponse.json(
        { error: 'sectionId dan title required' },
        { status: 400 }
      )
    }

    // Verify instructor owns the section
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { course: true },
    })

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })

    if (!dbUser || section.course.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get max order
    const lastLesson = await prisma.lesson.findFirst({
      where: { sectionId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const newOrder = (lastLesson?.order || 0) + 1

    const lesson = await prisma.lesson.create({
      data: {
        sectionId,
        title,
        description,
        videoUrl,
        duration: duration ? parseInt(duration) : null,
        difficulty,
        objectives,
        order: newOrder,
      },
    })

    console.log('✅ Lesson created:', lesson.id)

    return NextResponse.json({ success: true, lesson })
  } catch (error: any) {
    console.error('❌ Lesson error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to create lesson' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      lessonId,
      title,
      description,
      videoUrl,
      duration,
      difficulty,
      objectives,
      order,
    } = await request.json()

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId required' },
        { status: 400 }
      )
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: true } } },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })

    if (!dbUser || lesson.section.course.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(videoUrl && { videoUrl }),
        ...(duration && { duration: parseInt(duration) }),
        ...(difficulty && { difficulty }),
        ...(objectives && { objectives }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json({ success: true, lesson: updatedLesson })
  } catch (error: any) {
    console.error('❌ Update lesson error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to update lesson' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('id')

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId required' },
        { status: 400 }
      )
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: true } } },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })

    if (!dbUser || lesson.section.course.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Delete lesson error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to delete lesson' },
      { status: 500 }
    )
  }
}
