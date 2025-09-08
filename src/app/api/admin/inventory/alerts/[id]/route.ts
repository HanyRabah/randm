import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateAlertSchema = z.object({
  threshold: z.number().min(0).optional(),
  alertType: z.enum(['LOW_STOCK', 'OUT_OF_STOCK']).optional(),
  isActive: z.boolean().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alert = await db.inventoryAlert.findUnique({
      where: { id: params.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        variant: {
          select: {
            id: true,
            sku: true,
            inventory: true,
            product: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    // Add current stock and trigger status
    let currentStock = 0
    if (alert.variant) {
      currentStock = alert.variant.inventory
    }

    const isTriggered = alert.alertType === 'OUT_OF_STOCK' 
      ? currentStock === 0 
      : currentStock <= alert.threshold

    return NextResponse.json({
      ...alert,
      currentStock,
      isTriggered
    })

  } catch (error) {
    console.error('Error fetching inventory alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const validatedData = updateAlertSchema.parse(body)

    const existingAlert = await db.inventoryAlert.findUnique({
      where: { id: params.id }
    })

    if (!existingAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    const updatedAlert = await db.inventoryAlert.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        variant: {
          select: {
            id: true,
            sku: true,
            inventory: true,
            product: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedAlert)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating inventory alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingAlert = await db.inventoryAlert.findUnique({
      where: { id: params.id }
    })

    if (!existingAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    await db.inventoryAlert.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Alert deleted successfully' })

  } catch (error) {
    console.error('Error deleting inventory alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
