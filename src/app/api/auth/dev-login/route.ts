import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Find the admin user
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }

    // Create a session for development
    const session = await db.session.create({
      data: {
        userId: user.id,
        sessionToken: `dev-session-${Date.now()}`,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    // Set the session cookie
    cookies().set('next-auth.session-token', session.sessionToken, {
      expires: session.expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Dev login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
