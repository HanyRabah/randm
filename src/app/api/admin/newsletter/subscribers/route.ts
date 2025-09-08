import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const subscribersQuerySchema = z.object({
  page: z.string().transform(val => val ? parseInt(val) : 1).optional(),
  limit: z.string().transform(val => val ? parseInt(val) : 20).optional(),
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).optional(),
  source: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const {
      page = 1,
      limit = 20,
      search,
      status = 'all',
      source
    } = subscribersQuerySchema.parse(queryParams)

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status !== 'all') {
      where.isActive = status === 'active'
    }

    if (source) {
      where.source = source
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get subscribers and total count
    const [subscribers, totalCount, stats] = await Promise.all([
      db.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          source: true,
          subscribedAt: true,
          unsubscribedAt: true,
          lastEmailSent: true,
          preferences: true
        }
      }),
      db.newsletterSubscriber.count({ where }),
      db.newsletterSubscriber.groupBy({
        by: ['isActive'],
        _count: {
          isActive: true
        }
      })
    ])

    // Calculate stats
    const activeCount = stats.find((s: any) => s.isActive)?._count.isActive || 0
    const inactiveCount = stats.find((s: any) => !s.isActive)?._count.isActive || 0

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount
      }
    })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}

const bulkActionSchema = z.object({
  action: z.enum(['delete', 'activate', 'deactivate']),
  subscriberIds: z.array(z.string()).min(1, 'At least one subscriber must be selected')
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, subscriberIds } = bulkActionSchema.parse(body)

    let result
    switch (action) {
      case 'delete':
        result = await db.newsletterSubscriber.deleteMany({
          where: { id: { in: subscriberIds } }
        })
        break
      case 'activate':
        result = await db.newsletterSubscriber.updateMany({
          where: { id: { in: subscriberIds } },
          data: { 
            isActive: true,
            unsubscribedAt: null,
            subscribedAt: new Date()
          }
        })
        break
      case 'deactivate':
        result = await db.newsletterSubscriber.updateMany({
          where: { id: { in: subscriberIds } },
          data: { 
            isActive: false,
            unsubscribedAt: new Date()
          }
        })
        break
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}d ${result.count} subscriber(s)`,
      affectedCount: result.count
    })
  } catch (error) {
    console.error('Error performing bulk action:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}
