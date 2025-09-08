import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createMessageSchema = z.object({
  content: z.string().min(1).max(5000)
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content } = createMessageSchema.parse(body)

    // Verify ticket exists and user has access
    const ticket = await db.supportTicket.findUnique({
      where: { id: params.id }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.customerEmail !== session.user.email) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if ticket is closed
    if (ticket.status === 'CLOSED') {
      return NextResponse.json(
        { error: 'Cannot add messages to closed ticket' },
        { status: 400 }
      )
    }

    // Get user/customer info
    let userId: string | undefined
    if ((session.user as any).id) {
      userId = (session.user as any).id
    }

    const message = await db.supportMessage.create({
      data: {
        ticketId: params.id,
        content,
        isFromCustomer: true,
        userId,
        customerEmail: session.user.email,
        senderName: session.user.name || 'Customer'
      }
    })

    // Update ticket status if it was resolved
    if (ticket.status === 'RESOLVED') {
      await db.supportTicket.update({
        where: { id: params.id },
        data: { 
          status: 'OPEN',
          resolvedAt: null
        }
      })
    }

    return NextResponse.json(message, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating support message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
