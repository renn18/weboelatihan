import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
