import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import fsPromises from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('thumbnail') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate image
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    let url: string

    if (process.env.NODE_ENV === 'development') {
      // LOCAL: Promise-based fs write
      const filename = `thumb-${Date.now()}-${file.name}`
      const uploadDir = path.join(process.cwd(), 'public/uploads')
      
      await fsPromises.mkdir(uploadDir, { recursive: true })
      const buffer = Buffer.from(await file.arrayBuffer())
      
      await fsPromises.writeFile(path.join(uploadDir, filename), buffer)
      url = `/uploads/${filename}`
      
      console.log('Local upload success:', url)
      
    } else {
      // PRODUCTION: Vercel Blob dengan explicit Promise
      console.log('Attempting Blob upload. Token available:', !!process.env.BLOB_READ_WRITE_TOKEN)
      
      const bytes = await file.arrayBuffer() // Promise resolve buffer
      const filename = `course-thumb-${crypto.randomUUID()}-${file.name}`.replace(/[^a-z0-9.-]/gi, '')
      
      const blobPromise = put(filename, bytes, {
        access: 'public',
        contentType: file.type,
      })
      
      const blob = await blobPromise // Explicit await
      url = blob.url
      
      console.log('Blob upload success:', url)
    }

    return NextResponse.json({ 
      success: true, 
      url,
      filename: file.name 
    })

  } catch (error) {
    console.error('Upload error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      nodeEnv: process.env.NODE_ENV,
      tokenAvailable: !!process.env.BLOB_READ_WRITE_TOKEN
    })
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'UPLOAD_FAILED'
      }, 
      { status: 500 }
    )
  }
}
