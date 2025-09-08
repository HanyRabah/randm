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

    const where: any = { id: params.id }
    
    // If not admin, only show user's orders
    if (session.user.role !== 'ADMIN') {
      where.customerEmail = session.user.email
    }

    const order = await prisma.order.findUnique({
      where,
      include: {
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
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
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
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, trackingNumber } = body

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        trackingNumber,
        updatedAt: new Date()
      },
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
