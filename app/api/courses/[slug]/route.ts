import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    console.log(params.slug)
    // VALIDASI SLUG
    if (!params.slug) {
      return NextResponse.json(
        { success: false, message: 'Slug parameter required' },
        { status: 400 }
      )
    }

    console.log('🔍 Fetching course:', params.slug)

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
        { success: false, message: 'Course not found', slug: params.slug },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: course,
    })
  } catch (error) {
    console.error('💥 API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Server error',
      },
      { status: 500 }
    )
  }
}
