import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const unsubscribeSchema = z.object({
  token: z.string().min(1, 'Unsubscribe token is required'),
  email: z.string().email().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email } = unsubscribeSchema.parse(body)

    // Find subscriber by token
    const subscriber = await db.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token }
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 404 }
      )
    }

    // Verify email if provided
    if (email && subscriber.email !== email) {
      return NextResponse.json(
        { error: 'Email does not match the subscription' },
        { status: 400 }
      )
    }

    // Check if already unsubscribed
    if (!subscriber.isActive) {
      return NextResponse.json({
        success: true,
        message: 'You are already unsubscribed from our newsletter',
        alreadyUnsubscribed: true
      })
    }

    // Unsubscribe
    await db.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        isActive: false,
        unsubscribedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      email: subscriber.email
    })
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token) {
      return NextResponse.json(
        { error: 'Unsubscribe token is required' },
        { status: 400 }
      )
    }

    // Find subscriber by token
    const subscriber = await db.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token }
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 404 }
      )
    }

    // Verify email if provided
    if (email && subscriber.email !== email) {
      return NextResponse.json(
        { error: 'Email does not match the subscription' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      subscriber: {
        email: subscriber.email,
        firstName: subscriber.firstName,
        lastName: subscriber.lastName,
        isActive: subscriber.isActive,
        subscribedAt: subscriber.subscribedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching unsubscribe info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unsubscribe information' },
      { status: 500 }
    )
  }
}
