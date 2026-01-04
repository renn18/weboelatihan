import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface RouteProps {
  params: Promise<{ userId: string }>
}

// Admin update user role
export async function PATCH(request: NextRequest, { params }: RouteProps) {
  try {
    const { userId: adminClerkId } = await auth()

    if (!adminClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const admin = await prisma.user.findUnique({
      where: { clerkId: adminClerkId },
    })

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = await params
    const { role } = await request.json()

    // Validate role
    const validRoles = ['user', 'instructor', 'admin']
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Cannot change admin role
    if (targetUser.role === 'admin' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot change admin role' },
        { status: 400 }
      )
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        image: true,
      },
    })

    console.log(
      `✅ Admin updated user role: ${targetUser.email} -> ${role} (by ${admin.email})`
    )

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      user: updatedUser,
    })
  } catch (error: any) {
    console.error('❌ Admin update role error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to update user role' },
      { status: 500 }
    )
  }
}

// Admin get user details
export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { userId: adminClerkId } = await auth()

    if (!adminClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const admin = await prisma.user.findUnique({
      where: { clerkId: adminClerkId },
    })

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = await params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
        courses: {
          select: {
            id: true,
            title: true,
            isPublished: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            courseId: true,
            status: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error: any) {
    console.error('❌ Get user error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    )
  }
}
