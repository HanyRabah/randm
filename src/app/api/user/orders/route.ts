import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const orders = await db.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                slug: true
              }
            },
            variant: {
              select: {
                sku: true
              }
            }
          }
        },
        address: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const ordersWithDetails = orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      shippingCost: Number(order.shippingCost),
      paymentMethod: order.paymentMethod,
      address: {
        street: order.address?.street || '',
        city: order.address?.city || '',
        governorate: order.address?.governorate || ''
      },
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
      trackingNumber: order.trackingNumber,
      items: order.items.map((item: any) => ({
        id: item.id,
        productTitle: item.product.title,
        productSlug: item.product.slug,
        variantSku: item.variant.sku,
        quantity: item.quantity,
        price: Number(item.price)
      }))
    }))

    return NextResponse.json(ordersWithDetails)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
