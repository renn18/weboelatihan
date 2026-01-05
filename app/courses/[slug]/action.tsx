'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createMidtransTransaction } from '@/lib/payment'
import { revalidatePath } from 'next/cache'

export async function enrollAndPay(courseId: string) {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) throw new Error('Unauthorized')

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    })
    if (!dbUser) throw new Error('User not found')

    const course = await prisma.course.findUnique({
        where: { id: courseId },
    })
    if (!course || !course.isPublished) {
        throw new Error('Course not available')
    }
    if (course.price === 0) {
        throw new Error('This course is free, use enrollCourse only')
    }

    // pastikan enrollment ada
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

    const orderId = `ORDER-${enrollment.id}`

    const { transactionToken, redirectUrl } = await createMidtransTransaction(
        orderId,
        course.price,
        dbUser.email ?? '',
        dbUser.name ?? '',
        course.title,
    )

    await prisma.payment.upsert({
        where: { enrollmentId: enrollment.id },
        update: {
            amount: course.price,
            currency: 'IDR',
            midtransOrderId: orderId,
            transactionToken,
            redirectUrl,
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
            redirectUrl,
            status: 'pending',
        },
    })

    revalidatePath('/dashboard')
    revalidatePath(`/courses/${course.slug}`)

    // ini yang dipakai di client untuk open Snap
    return { transactionToken, redirectUrl }
}

export async function enrollCourse(courseId: string) {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) throw new Error('Unauthorized')

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    })
    if (!dbUser) throw new Error('User not found')

    // pastikan course ada & sudah published
    const course = await prisma.course.findUnique({
        where: { id: courseId },
    })
    if (!course || !course.isPublished) {
        throw new Error('Course not available')
    }

    // cek apakah user sudah enroll
    const existing = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: dbUser.id,
                courseId,
            },
        },
    })

    if (existing) {
        // kalau sudah enroll, tidak perlu create lagi
        return existing
    }

    const enrollment = await prisma.enrollment.create({
        data: {
            userId: dbUser.id,
            courseId,
            // kalau course free, bisa langsung active
            status: course.price === 0 ? 'active' : 'pending',
        },
    })

    // refresh dashboard / halaman course
    revalidatePath('/dashboard')
    revalidatePath(`/courses/${course.slug}`)

    return enrollment
}

export async function getEnrollmentStatus(courseId: string) {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) return null

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    })
    if (!dbUser) return null

    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: dbUser.id,
                courseId,
            },
        },
        select: { status: true },
    })

    return enrollment?.status === 'active' ? 'enrolled' : 'idle'
}