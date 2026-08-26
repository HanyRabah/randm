import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELED']),
  courier: z.string().optional(),
  airwayBill: z.string().optional(),
  trackingUrl: z.string().url().optional().or(z.literal('')),
  estimatedDelivery: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
  notes: z.string().optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateOrderStatusSchema.parse(body)

    // Check if order exists
    const existingOrder = await db.order.findUnique({
      where: { id: params.id }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      status: validatedData.status,
      updatedAt: new Date()
    }

    if (validatedData.courier !== undefined) {
      updateData.courier = validatedData.courier || null
    }

    if (validatedData.airwayBill !== undefined) {
      updateData.airwayBill = validatedData.airwayBill || null
    }

    if (validatedData.trackingUrl !== undefined) {
      updateData.trackingUrl = validatedData.trackingUrl || null
    }

    if (validatedData.estimatedDelivery) {
      updateData.estimatedDelivery = new Date(validatedData.estimatedDelivery)
    }

    if (validatedData.deliveredAt) {
      updateData.deliveredAt = new Date(validatedData.deliveredAt)
    } else if (validatedData.status === 'DELIVERED') {
      updateData.deliveredAt = new Date()
    }

    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes || null
    }

    // Update the order
    const updatedOrder = await db.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        address: true
      }
    })

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        courier: updatedOrder.courier,
        airwayBill: updatedOrder.airwayBill,
        trackingUrl: updatedOrder.trackingUrl,
        estimatedDelivery: updatedOrder.estimatedDelivery?.toISOString(),
        deliveredAt: updatedOrder.deliveredAt?.toISOString(),
        updatedAt: updatedOrder.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
