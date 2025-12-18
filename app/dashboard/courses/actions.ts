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
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = Number(formData.get('price'))

  await prisma.course.create({
    data: {
      title,
      slug: slugify(title),
      description,
      price,
    },
  })

  revalidatePath('/dashboard/courses')
}

export async function deleteCourse(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  await prisma.course.delete({ where: { id } })

  revalidatePath('/dashboard/courses')
}

export async function updateCourse(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  if (!id || !title || !description) {
    throw new Error('Invalid data')
  }

  await prisma.course.update({
    where: { id },
    data: {
      title,
      description,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
    },
  })

  revalidatePath('/dashboard/courses')
}

export async function updateThumbnail(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

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

  await prisma.course.update({
    where: { id },
    data: {
      thumbnail: imageUrl,
    },
  })

  revalidatePath('/dashboard/courses')
}
