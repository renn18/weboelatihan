import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: params.slug },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: course,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course' },
      { status: 500 }
    )
  }
}
