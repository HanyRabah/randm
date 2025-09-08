import { NextRequest, NextResponse } from 'next/server'

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

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomString}.${extension}`

    // TODO: Upload to blob storage when BLOB_URL is configured
    // For now, we'll simulate the upload and return a placeholder URL
    const blobUrl = process.env.BLOB_URL
    
    if (blobUrl) {
      // Upload to actual blob storage
      const uploadResponse = await fetch(`${blobUrl}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Filename': filename,
        },
        body: buffer,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to blob storage')
      }

      const { url } = await uploadResponse.json()
      return NextResponse.json({ url })
    } else {
      // Development mode - return a placeholder URL
      console.log('BLOB_URL not configured, using placeholder URL')
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
