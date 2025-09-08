import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createTicketSchema = z.object({
  subject: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  category: z.enum(['GENERAL', 'ORDER', 'PRODUCT', 'TECHNICAL', 'BILLING']).default('GENERAL'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  customerName: z.string().optional(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional()
})

// Generate unique ticket number
function generateTicketNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `TICKET-${dateStr}-${random}`
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const where: any = {
      customerEmail: userEmail
    }

    if (status) {
      where.status = status
    }

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        include: {
          messages: {
            where: {
              isInternal: false // Only show non-internal messages to customers
            },
            orderBy: {
              createdAt: 'asc'
            },
            take: 1 // Just get the latest message for preview
          },
          assignedTo: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.supportTicket.count({ where })
    ])

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const validatedData = createTicketSchema.parse(body)

    // Generate unique ticket number
    let ticketNumber = generateTicketNumber()
    let attempts = 0
    while (attempts < 5) {
      const existing = await db.supportTicket.findUnique({
        where: { ticketNumber }
      })
      if (!existing) break
      ticketNumber = generateTicketNumber()
      attempts++
    }

    if (attempts >= 5) {
      return NextResponse.json(
        { error: 'Unable to generate unique ticket number' },
        { status: 500 }
      )
    }

    // Check if user is authenticated and get user/customer info
    let userId: string | undefined
    let customerId: string | undefined

    if (session?.user) {
      if ((session.user as any).id) {
        userId = (session.user as any).id
      } else {
        // Check if customer exists
        const customer = await db.customer.findUnique({
          where: { email: session.user.email }
        })
        if (customer) {
          customerId = customer.id
        }
      }
    }

    const ticket = await db.supportTicket.create({
      data: {
        ticketNumber,
        subject: validatedData.subject,
        description: validatedData.description,
        category: validatedData.category,
        priority: validatedData.priority,
        userId,
        customerId,
        customerName: validatedData.customerName || session?.user?.name,
        customerEmail: validatedData.customerEmail,
        customerPhone: validatedData.customerPhone
      },
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Create initial message with the description
    await db.supportMessage.create({
      data: {
        ticketId: ticket.id,
        content: validatedData.description,
        isFromCustomer: true,
        userId,
        customerEmail: validatedData.customerEmail,
        senderName: validatedData.customerName || session?.user?.name || 'Customer'
      }
    })

    return NextResponse.json(ticket, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating support ticket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
