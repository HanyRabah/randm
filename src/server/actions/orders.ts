'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
// import { OrderStatus } from '@prisma/client'
import { verifyOTP } from '@/lib/otp'

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const order = await db.order.update({
      where: { id: orderId },
      data: { 
        status: status as any,
        updatedAt: new Date(),
      },
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/track/${order.orderNumber}`)
    
    return { success: true, order }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}

export async function markCodCollected(orderId: string) {
  try {
    const order = await db.order.update({
      where: { id: orderId },
      data: { 
        codCollected: true,
        status: 'DELIVERED',
        updatedAt: new Date(),
      },
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/track/${order.orderNumber}`)
    
    return { success: true, order }
  } catch (error) {
    console.error('Error marking COD collected:', error)
    return { success: false, error: 'Failed to mark COD as collected' }
  }
}

export async function verifyOrderOTP(orderNumber: string, otp: string) {
  try {
    // Get order first
    const order = await db.order.findUnique({
      where: { orderNumber },
      include: { customer: true },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.otpVerified) {
      return { success: false, error: 'Order already verified' }
    }

    // Verify OTP
    const otpResult = await verifyOTP(order.contactPhone, otp)
    if (!otpResult) {
      return { success: false, error: 'Invalid OTP' }
    }

    // Update order
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: { 
        otpVerified: true,
        status: 'CONFIRMED',
        updatedAt: new Date(),
      },
    })

    revalidatePath(`/track/${orderNumber}`)
    
    return { success: true, order: updatedOrder }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return { success: false, error: 'Failed to verify OTP' }
  }
}

export async function cancelOrder(orderId: string, reason?: string) {
  try {
    // Get order with items to restore inventory
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELED') {
      return { success: false, error: 'Cannot cancel this order' }
    }

    // Restore inventory for each item
    for (const item of order.items) {
      if (item.variantId) {
        await db.variant.update({
          where: { id: item.variantId },
          data: { inventory: { increment: item.quantity } },
        })
      }
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { 
        status: 'CANCELED',
        updatedAt: new Date(),
      },
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/track/${order.orderNumber}`)
    
    return { success: true, order: updatedOrder }
  } catch (error) {
    console.error('Error canceling order:', error)
    return { success: false, error: 'Failed to cancel order' }
  }
}

export async function exportOrdersForCourier(orderIds: string[]) {
  try {
    const orders = await db.order.findMany({
      where: { 
        id: { in: orderIds },
        status: { in: ['CONFIRMED', 'PACKED'] },
      },
      include: {
        customer: true,
        address: true,
        items: {
          include: {
            product: { select: { title: true } },
          },
        },
      },
    })

    // Generate CSV data
    const csvHeaders = [
      'Order Number',
      'Customer Name',
      'Phone',
      'Address',
      'City',
      'Total Amount',
      'COD Amount',
      'Items',
      'Status',
    ]

    const csvData = orders.map((order: any) => [
      order.orderNumber,
      `${order.customer.firstName} ${order.customer.lastName}`,
      order.contactPhone,
      `${order.address.line1}${order.address.line2 ? ', ' + order.address.line2 : ''}`,
      order.address.city,
      order.total.toString(),
      order.codCollected ? '0' : order.total.toString(),
      order.items.map((item: any) => `${item.product.title} (${item.quantity})`).join('; '),
      order.status,
    ])

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map((field: any) => `"${field}"`).join(','))
      .join('\n')

    // Update orders to OUT_FOR_DELIVERY
    await db.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status: 'OUT_FOR_DELIVERY' },
    })

    revalidatePath('/admin/orders')

    return { 
      success: true, 
      csvContent,
      filename: `orders-export-${new Date().toISOString().split('T')[0]}.csv`
    }
  } catch (error) {
    console.error('Error exporting orders:', error)
    return { success: false, error: 'Failed to export orders' }
  }
}
