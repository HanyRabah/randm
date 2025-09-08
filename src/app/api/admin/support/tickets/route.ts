import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().optional(),
  category: z.enum(['GENERAL', 'ORDER', 'PRODUCT', 'TECHNICAL', 'BILLING']).optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const assignedToId = searchParams.get('assignedToId')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status) where.status = status
    if (priority) where.priority = priority
    if (category) where.category = category
    if (assignedToId) where.assignedToId = assignedToId

    if (search) {
      where.OR = [
        {
          ticketNumber: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          subject: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          customerEmail: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          customerName: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          },
          _count: {
            select: {
              messages: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      db.supportTicket.count({ where })
    ])

    // Get stats
    const stats = await db.supportTicket.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const statusStats = stats.reduce((acc: any, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {})

    return NextResponse.json({
      tickets,
      stats: statusStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching admin support tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ticketIds, ...updateData } = body

    if (action === 'bulk_update' && ticketIds?.length) {
      const validatedData = updateTicketSchema.parse(updateData)
      
      const updatePayload: any = { ...validatedData }
      
      if (validatedData.status === 'RESOLVED' && !updatePayload.resolvedAt) {
        updatePayload.resolvedAt = new Date()
      }
      if (validatedData.status === 'CLOSED' && !updatePayload.closedAt) {
        updatePayload.closedAt = new Date()
      }
      if (validatedData.assignedToId && !updatePayload.assignedAt) {
        updatePayload.assignedAt = new Date()
      }

      await db.supportTicket.updateMany({
        where: {
          id: {
            in: ticketIds
          }
        },
        data: updatePayload
      })

      return NextResponse.json({ 
        message: `Updated ${ticketIds.length} tickets successfully` 
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing ticket IDs' },
      { status: 400 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in admin support tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
