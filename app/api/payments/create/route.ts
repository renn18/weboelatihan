import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createMidtransTransaction } from '@/lib/payment'

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

    // Pastikan course ada
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
    }

    if (course.price === 0) {
      return NextResponse.json({ success: false, message: 'Free course, use enrollments API' }, { status: 400 })
    }

    // Cek enrollment sudah ada
    let enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: dbUser.id,
          courseId,
        },
      },
    })

    if (!enrollment) {
      enrollment = await prisma.enrollment.create({
        data: {
          userId: dbUser.id,
          courseId,
          status: 'pending',
        },
      })
    }

    // Buat Midtrans transaction
    const orderId = `ORDER-${enrollment.id}-${Date.now()}`
    const email = dbUser.email || 'user@example.com'
    const name = dbUser.name || 'User'

    const { transactionToken } = await createMidtransTransaction(
      orderId,
      course.price,
      email,
      name,
      course.title
    )

    // Simpan payment record
    await prisma.payment.upsert({
      where: { enrollmentId: enrollment.id },
      update: {
        amount: course.price,
        currency: 'IDR',
        midtransOrderId: orderId,
        transactionToken,
        status: 'pending',
      },
      create: {
        enrollmentId: enrollment.id,
        userId: dbUser.id,
        courseId: course.id,
        amount: course.price,
        currency: 'IDR',
        midtransOrderId: orderId,
        transactionToken,
        status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      transactionToken,
      enrollmentId: enrollment.id,
    })
  } catch (error: any) {
    console.error('Payment create error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Payment creation failed' },
      { status: 500 }
    )
  }
}
