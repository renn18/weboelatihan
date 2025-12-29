'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export async function createCourse(formData: FormData) {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) throw new Error('Unauthorized')

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  })

  if (!dbUser) throw new Error('User not found')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = Number(formData.get('price'))
  const category = formData.get('category') as string

  await prisma.course.create({
    data: {
      title,
      slug: slugify(title),
      description,
      price,
      category,
      userId: dbUser.id, 
    },
  })

  revalidatePath('/dashboard/courses')
}

export async function deleteCourse(id: string) {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) throw new Error('Unauthorized')

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  })

  if (!dbUser) throw new Error('User not found')

  await prisma.course.delete({
    where: {
      id,
      userId: dbUser.id,
    },
  })

  revalidatePath('/dashboard/courses')
}

export async function updateCourse(formData: FormData) {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) throw new Error('Unauthorized')

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  })

  if (!dbUser) throw new Error('User not found')

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const price = Number(formData.get('price'))

  if (!id || !title || !description) {
    throw new Error('Invalid data')
  }

  await prisma.course.update({
  where: {
    id,
    userId: dbUser.id,
  },
  data: {
    title,
    description,
    category,
    price,
    slug: slugify(title),
  },
})

  revalidatePath('/dashboard/courses')
}

export async function updateThumbnail(formData: FormData) {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) throw new Error('Unauthorized')

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  })

  if (!dbUser) throw new Error('User not found')

  const id = formData.get('id') as string
  const file = formData.get('file') as File

  if (!id || !file) {
    throw new Error('Invalid data')
  }

  // convert file → buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // folder public/uploads
  const uploadDir = path.join(process.cwd(), 'public/uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const filename = `${Date.now()}-${file.name}`
  const filepath = path.join(uploadDir, filename)

  fs.writeFileSync(filepath, buffer)

  const imageUrl = `/uploads/${filename}`

  const existing = await prisma.course.findFirst({
  where: {
    id,
    userId: dbUser.id,
  },
  select: { thumbnail: true },
})

if (existing?.thumbnail) {
  const oldPath = path.join(
    process.cwd(),
    'public',
    existing.thumbnail
  )

  if (fs.existsSync(oldPath)) {
    fs.unlinkSync(oldPath)
  }
}

  await prisma.course.update({
    where: { id, userId: dbUser.id },
    data: {
      thumbnail: imageUrl,
    },
  })

  revalidatePath('/dashboard/courses')
}

export async function deleteThumbnail(courseId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { thumbnail: true },
  })

  if (!course || !course.thumbnail) {
    return
  }

  // contoh: /uploads/123-image.png
  const filePath = path.join(
    process.cwd(),
    'public',
    course.thumbnail
  )

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { thumbnail: null },
  })

  revalidatePath('/dashboard/courses')
}

export async function publishCourse(courseId: string) {
  const { userId: clerkId } = await auth()
  if (!clerkId) throw new Error('Unauthorized')

  const user = await prisma.user.findUnique({
    where: { clerkId },
  })
  if (!user) throw new Error('User not found')

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })
  if (!course) throw new Error('Course not found')

  // 🔐 hanya owner atau admin
  if (course.userId !== user.id && user.role !== 'admin') {
    throw new Error('Forbidden')
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { isPublished: true },
  })

  revalidatePath('/dashboard/courses')
}

export async function unpublishCourse(courseId: string) {
  const { userId: clerkId } = await auth()
  if (!clerkId) throw new Error('Unauthorized')

  const user = await prisma.user.findUnique({
    where: { clerkId },
  })
  if (!user) throw new Error('User not found')

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })
  if (!course) throw new Error('Course not found')

  if (course.userId !== user.id && user.role !== 'admin') {
    throw new Error('Forbidden')
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { isPublished: false },
  })

  revalidatePath('/dashboard/courses')
}