// app/api/enrollments/check/route.ts
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) {
    return NextResponse.json({ enrolled: false }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  })
  if (!dbUser) {
    return NextResponse.json({ enrolled: false }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')

  if (!courseId) {
    return NextResponse.json({ enrolled: false }, { status: 400 })
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: dbUser.id,
        courseId,
      },
    },
  })

  return NextResponse.json({ enrolled: enrollment?.status === 'active' })
}
