import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

    const where: any = {}
    
    // If not admin, only show user's orders
    if (session.user.role !== 'ADMIN') {
      where.customerEmail = session.user.email
    }
    
    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.order.count({ where })

    return NextResponse.json({
      orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      couponCode,
      subtotal,
      discount,
      total
    } = body

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Validate coupon if provided
      let coupon = null
      if (couponCode) {
        coupon = await tx.coupon.findUnique({
          where: { code: couponCode, isActive: true }
        })
        
        if (!coupon) {
          throw new Error('Invalid coupon code')
        }
        
        // Check coupon validity
        const now = new Date()
        if (coupon.startsAt && coupon.startsAt > now) {
          throw new Error('Coupon not yet active')
        }
        if (coupon.endsAt && coupon.endsAt < now) {
          throw new Error('Coupon has expired')
        }
        if (coupon.maxRedemptions && coupon.usageCount >= coupon.maxRedemptions) {
          throw new Error('Coupon usage limit reached')
        }
      }

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          subtotal,
          discount: discount || 0,
          total,
          status: 'PENDING',
          couponId: coupon?.id,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price
            }))
          }
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

      // Update coupon usage count
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } }
        })
      }

      // Update variant inventory
      for (const item of items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { inventory: { decrement: item.quantity } }
        })
      }

      return newOrder
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}
