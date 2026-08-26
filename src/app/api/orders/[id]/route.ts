import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        address: true,
        items: {
          include: {
            product: {
              include: {
                media: {
                  take: 1,
                  orderBy: { position: 'asc' }
                }
              }
            },
            variant: true
          }
        },
        coupon: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const isAdmin = (session.user as any).role === 'ADMIN'
    const userId = (session.user as any).id as string | undefined
    const ownsByUser = userId && order.userId === userId
    const ownsByEmail = session.user.email && order.customer?.email === session.user.email
    if (!isAdmin && !ownsByUser && !ownsByEmail) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, airwayBill, trackingUrl, courier } = body

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status, airwayBill, trackingUrl, courier },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        coupon: true
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
