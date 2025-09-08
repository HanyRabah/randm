import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  preferences: z.object({
    categories: z.array(z.string()).optional(),
    frequency: z.enum(['weekly', 'monthly']).default('weekly'),
    promotions: z.boolean().default(true)
  }).optional(),
  source: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, preferences, source } = subscribeSchema.parse(body)

    // Check if email already exists
    const existingSubscriber = await db.newsletterSubscriber.findUnique({
      where: { email }
    })

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter' },
          { status: 409 }
        )
      } else {
        // Reactivate existing subscriber
        const reactivatedSubscriber = await db.newsletterSubscriber.update({
          where: { email },
          data: {
            isActive: true,
            firstName: firstName || existingSubscriber.firstName,
            lastName: lastName || existingSubscriber.lastName,
            preferences: preferences || existingSubscriber.preferences,
            source: source || existingSubscriber.source,
            subscribedAt: new Date(),
            unsubscribedAt: null
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Successfully resubscribed to newsletter!',
          subscriber: {
            id: reactivatedSubscriber.id,
            email: reactivatedSubscriber.email,
            firstName: reactivatedSubscriber.firstName,
            lastName: reactivatedSubscriber.lastName
          }
        })
      }
    }

    // Create new subscriber
    const newSubscriber = await db.newsletterSubscriber.create({
      data: {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        preferences: preferences || null,
        source: source || 'direct'
      }
    })

    // TODO: Send welcome email here
    // await sendWelcomeEmail(newSubscriber.email, newSubscriber.firstName)

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      subscriber: {
        id: newSubscriber.id,
        email: newSubscriber.email,
        firstName: newSubscriber.firstName,
        lastName: newSubscriber.lastName
      }
    })
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}
