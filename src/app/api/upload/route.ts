import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `products/${timestamp}-${randomString}.${extension}`

    // Check if Vercel Blob token is configured
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    
    if (blobToken) {
      // Upload to Vercel Blob storage
      const blob = await put(filename, file, {
        access: 'public',
        token: blobToken,
      })

      return NextResponse.json({ url: blob.url })
    } else {
      // Development mode - return a placeholder URL
      console.log('BLOB_READ_WRITE_TOKEN not configured, using placeholder URL')
      const placeholderUrl = `https://via.placeholder.com/400x400/cccccc/666666?text=${encodeURIComponent(file.name)}`
      return NextResponse.json({ url: placeholderUrl })
    }

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
