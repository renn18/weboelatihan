import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ enrolledCourses: [] }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })
    if (!dbUser) {
      return NextResponse.json({ enrolledCourses: [] }, { status: 404 })
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: dbUser.id,
        status: 'active',
      },
      include: {
        course: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        progress: {
          include: {
            lesson: {
              include: {
                section: true,
              },
            },
          },
        },
        certificate: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      enrolledCourses: enrollments.map(enrollment => ({
        id: enrollment.id,
        course: enrollment.course,
        progress: enrollment.progress,
        totalLessons: enrollment.progress.length,
        completedLessons: enrollment.progress.filter(p => p.isCompleted).length,
        hasCertificate: !!enrollment.certificate,
        enrolledAt: enrollment.createdAt,
      })),
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ enrolledCourses: [] }, { status: 500 })
  }
}

// ✅ TAMBAH POST HANDLER INI
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })
    if (!dbUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const { courseId } = await request.json()
    if (!courseId) {
      return NextResponse.json({ success: false, message: 'Course ID required' }, { status: 400 })
    }

    // Cek sudah enroll
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: dbUser.id,
          courseId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        message: 'Already enrolled',
        enrollment: existing 
      })
    }

    // Cek course ada
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
    }

    // Buat enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: dbUser.id,
        courseId,
        status: course.price === 0 ? 'active' : 'pending',
      },
      include: { course: true },
    })

    console.log('✅ Enrollment created:', enrollment.id)

    return NextResponse.json({ 
      success: true, 
      enrollment,
      isFree: course.price === 0 
    })
  } catch (error: any) {
    console.error('Enrollment POST error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Enrollment failed' },
      { status: 500 }
    )
  }
}
