// /app/api/courses/route.ts

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

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

    return NextResponse.json({ success: true, data: courses })
  } catch (error: any) {
    console.error('❌ Get courses error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // ✅ Check auth
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized - please login' },
        { status: 401 }
      )
    }

    // ✅ Check admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, role: true },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - only admins can create courses' },
        { status: 403 }
      )
    }

    // ✅ Validate input
    const body = await req.json()
    const { title, slug, description, price, category } = body

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      )
    }

    // ✅ Check slug uniqueness
    const existing = await prisma.course.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Course with this slug already exists' },
        { status: 409 }
      )
    }

    // ✅ Create course
    const course = await prisma.course.create({
      data: {
        title,
        category,
        slug,
        description: description || '',
        price: price || 0,
        userId: user.id,
        isPublished: false,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        isPublished: true,
        createdAt: true,
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create course' },
      { status: 500 }
    )
  }
}