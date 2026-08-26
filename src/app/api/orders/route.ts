import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// ponytail: order CREATION lives in the server action src/server/actions/checkout.ts
// This route only exposes read access for the account UI. Add POST here if a
// public JSON API is ever needed.
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') || undefined

    const isAdmin = (session.user as any).role === 'ADMIN'
    const userId = (session.user as any).id as string | undefined

    // Non-admins see orders linked to their user OR to a customer row that
    // shares their email (guest checkouts they later signed in for).
    const where: any = { ...(status ? { status } : {}) }
    if (!isAdmin) {
      where.OR = [
        userId ? { userId } : null,
        session.user.email ? { customer: { email: session.user.email } } : null,
      ].filter(Boolean)
      if (!where.OR.length) return NextResponse.json({ orders: [], pagination: { total: 0, limit, offset, hasMore: false } })
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: { include: { media: { take: 1, orderBy: { position: 'asc' } } } },
              variant: true,
            },
          },
          coupon: true,
          address: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
