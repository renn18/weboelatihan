import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enrollmentId, lessonId } = await request.json()

    if (!enrollmentId || !lessonId) {
      return NextResponse.json(
        { error: 'enrollmentId dan lessonId required' },
        { status: 400 }
      )
    }

    // Get enrollment & verify user
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { user: true },
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    // Get user
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })

    if (!dbUser || enrollment.user.id !== dbUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ✅ Upsert dengan unique constraint yang benar
    const progress = await prisma.progress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
      create: {
        enrollmentId,
        lessonId,
        userId: dbUser.id,
        isCompleted: true,
        completedAt: new Date(),
      },
    })

    console.log('✅ Progress saved:', progress.id)

    return NextResponse.json({
      success: true,
      progress,
    })
  } catch (error: any) {
    console.error('❌ Progress error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to update progress' },
      { status: 500 }
    )
  }
}
