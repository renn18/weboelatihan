import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId, title, description } = await request.json()

    if (!courseId || !title) {
      return NextResponse.json(
        { error: 'courseId dan title required' },
        { status: 400 }
      )
    }

    // Verify instructor owns the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { user: true },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })

    if (!dbUser || course.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get max order
    const lastSection = await prisma.section.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const newOrder = (lastSection?.order || 0) + 1

    const section = await prisma.section.create({
      data: {
        courseId,
        title,
        description,
        order: newOrder,
      },
    })

    console.log('✅ Section created:', section.id)

    return NextResponse.json({ success: true, section })
  } catch (error: any) {
    console.error('❌ Section error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to create section' },
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

    const { sectionId, title, description, order } = await request.json()

    if (!sectionId) {
      return NextResponse.json(
        { error: 'sectionId required' },
        { status: 400 }
      )
    }

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

    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json({ success: true, section: updatedSection })
  } catch (error: any) {
    console.error('❌ Update section error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to update section' },
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
    const sectionId = searchParams.get('id')

    if (!sectionId) {
      return NextResponse.json(
        { error: 'sectionId required' },
        { status: 400 }
      )
    }

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

    await prisma.section.delete({
      where: { id: sectionId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Delete section error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to delete section' },
      { status: 500 }
    )
  }
}
