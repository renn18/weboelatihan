import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (slug) {
    // SINGLE COURSE
    const course = await prisma.course.findUnique({
      where: { slug },
      include: { user: { select: { name: true } } },
    })
    
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data: course })
  }

  // LIST COURSES
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json({ success: true, data: courses })
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })

    if (!dbUser || dbUser.role !== 'instructor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, slug, description, price, thumbnail, category } =
      await request.json()

    if (!title || !slug || !description) {
      return NextResponse.json(
        { error: 'title, slug, dan description wajib' },
        { status: 400 }
      )
    }

    // Check slug unique
    const existing = await prisma.course.findFirst({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Slug sudah digunakan' },
        { status: 400 }
      )
    }

    const course = await prisma.course.create({
      data: {
        userId: dbUser.id,
        title,
        slug,
        description,
        price: price || 0,
        thumbnail,
        category,
        isPublished: false,
      },
    })

    console.log('✅ Course created:', course.id)

    return NextResponse.json({ success: true, course })
  } catch (error: any) {
    console.error('❌ Course creation error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to create course' },
      { status: 500 }
    )
  }
}