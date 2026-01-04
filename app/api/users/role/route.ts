import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()

    // Validate role
    const validRoles = ['user', 'instructor', 'admin']
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
      },
    })

    console.log(`✅ User role updated: ${user.email} -> ${role}`)

    return NextResponse.json({
      success: true,
      message: `Role updated to ${role}`,
      user: updatedUser,
    })
  } catch (error: any) {
    console.error('❌ Update role error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to update role' },
      { status: 500 }
    )
  }
}

// GET - Get current user role
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        image: true,
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
