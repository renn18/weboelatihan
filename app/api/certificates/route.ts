import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enrollmentId } = await request.json()

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'enrollmentId required' },
        { status: 400 }
      )
    }

    // Get enrollment with course & user info
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: true,
        course: true,
        certificate: true,
        progress: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    // Check if user is the owner or instructor
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })

    if (
      !dbUser ||
      (enrollment.userId !== dbUser.id && enrollment.course.userId !== dbUser.id)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if already has certificate
    if (enrollment.certificate) {
      return NextResponse.json(
        { error: 'Certificate already generated' },
        { status: 400 }
      )
    }

    // Check if course is completed
    // Calculate progress: completed lessons / total lessons
    const totalLessons = await prisma.lesson.count({
      where: {
        section: {
          courseId: enrollment.courseId,
        },
      },
    })

    const completedLessons = await prisma.progress.count({
      where: {
        enrollmentId,
        isCompleted: true,
      },
    })

    const progressPercentage =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    if (progressPercentage < 100) {
      return NextResponse.json(
        {
          error: `Course not completed yet (${progressPercentage}% progress)`,
        },
        { status: 400 }
      )
    }

    // Generate unique certificate number (SHA-256 hash)
    const rawCertificateNumber = `${enrollment.courseId}-${enrollment.userId}-${Date.now()}`
    const certificateNumber = crypto
      .createHash('sha256')
      .update(rawCertificateNumber)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase()

    // Generate verification hash
    const verificationData = `${certificateNumber}-${enrollment.courseId}-${enrollment.userId}-${new Date().toISOString()}`
    const verificationHash = crypto
      .createHash('sha256')
      .update(verificationData)
      .digest('hex')

    const certificate = await prisma.certificate.create({
      data: {
        enrollmentId,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        certificateNumber,
        verificationHash,
        status: 'active',
        isVerified: true,
      },
      include: {
        enrollment: {
          include: {
            user: true,
            course: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    // Update enrollment status to completed
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: 'completed' },
    })

    console.log('✅ Certificate generated:', certificate.id)

    return NextResponse.json({ success: true, certificate })
  } catch (error: any) {
    console.error('❌ Certificate error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to generate certificate' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const certificateNumber = searchParams.get('certificateNumber')
    const verificationHash = searchParams.get('verificationHash')

    let certificate = null

    if (certificateNumber) {
      certificate = await prisma.certificate.findUnique({
        where: { certificateNumber },
        include: {
          user: true,
          course: true,
          enrollment: true,
        },
      })
    } else if (verificationHash) {
      certificate = await prisma.certificate.findUnique({
        where: { verificationHash },
        include: {
          user: true,
          course: true,
          enrollment: true,
        },
      })
    } else {
      return NextResponse.json(
        { error: 'certificateNumber or verificationHash required' },
        { status: 400 }
      )
    }

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Check verification status
    const isValid =
      certificate.status === 'active' &&
      certificate.isVerified &&
      (!certificate.expiresAt || certificate.expiresAt > new Date())

    return NextResponse.json({
      success: true,
      certificate: {
        ...certificate,
        isValid,
      },
    })
  } catch (error: any) {
    console.error('❌ Get certificate error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to get certificate' },
      { status: 500 }
    )
  }
}

// Revoke certificate (Instructor only)
export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const certificateId = searchParams.get('id')

    if (!certificateId) {
      return NextResponse.json(
        { error: 'certificateId required' },
        { status: 400 }
      )
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: { course: true },
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })

    // Only instructor can revoke
    if (!dbUser || certificate.course.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.certificate.update({
      where: { id: certificateId },
      data: { status: 'revoked' },
    })

    console.log('✅ Certificate revoked:', certificateId)

    return NextResponse.json({ success: true, certificate: updated })
  } catch (error: any) {
    console.error('❌ Revoke certificate error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to revoke certificate' },
      { status: 500 }
    )
  }
}
