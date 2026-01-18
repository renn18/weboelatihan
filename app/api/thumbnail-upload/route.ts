import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('thumbnail') as File

    if (!file || file.type !== 'image/jpeg' && file.type !== 'image/png') {
      return NextResponse.json({ error: 'Invalid image file' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Local vs Production
    let url: string
    if (process.env.NODE_ENV === 'development') {
      // Local: Save to public/uploads
      const fs = await import('fs/promises')
      const path = await import('path')
      const filename = `thumb-${Date.now()}-${file.name}`
      const uploadDir = path.default.join(process.cwd(), 'public/uploads')
      await fs.mkdir(uploadDir, { recursive: true })
      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(path.default.join(uploadDir, filename), buffer)
      url = `/uploads/${filename}`
    } else {
        const newFilename = `course-thumb-${Date.now()}-${file.name}`.replace(/[^a-z0-9.-]/gi, '')
      // Production: Vercel Blob
      const blob = await put(newFilename, file, {
        access: 'public',
      })
      url = blob.url
    }

    return NextResponse.json({ success: true, url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
