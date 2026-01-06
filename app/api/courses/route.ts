// /app/api/courses/route.ts

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (slug) {
      // Get single course by slug
      const course = await prisma.course.findUnique({
        where: { slug },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          sections: {
            include: {
              lessons: {
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!course) {
        return NextResponse.json({ success: false, data: null }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: course })
    }

    // Get all published courses
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        price: true,
        isPublished: true,
        user: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      take: 10, // Limit to 10 courses
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(courses)

    return NextResponse.json({ success: true, data: courses })
  } catch (error: any) {
    console.error('❌ Get courses error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
