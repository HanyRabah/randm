import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createAlertSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  threshold: z.number().min(0),
  alertType: z.enum(['LOW_STOCK', 'OUT_OF_STOCK']).default('LOW_STOCK')
}).refine(data => data.productId || data.variantId, {
  message: "Either productId or variantId must be provided"
}).refine(data => !(data.productId && data.variantId), {
  message: "Cannot set both productId and variantId"
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
    const isActive = searchParams.get('isActive')
    const alertType = searchParams.get('alertType')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }
    
    if (alertType) {
      where.alertType = alertType
    }

    if (search) {
      where.OR = [
        {
          product: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          variant: {
            sku: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    const [alerts, total] = await Promise.all([
      db.inventoryAlert.findMany({
        where,
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.inventoryAlert.count({ where })
    ])

    // Check current stock levels and trigger status
    const alertsWithStatus = alerts.map((alert: any) => {
      let currentStock = 0
      let isTriggered = false

      if (alert.variant) {
        currentStock = alert.variant.inventory
      } else if (alert.product) {
        // For product-level alerts, sum all variant inventories
        // This would need a separate query in a real implementation
        currentStock = 0 // Placeholder
      }

      isTriggered = alert.alertType === 'OUT_OF_STOCK' 
        ? currentStock === 0 
        : currentStock <= alert.threshold

      return {
        ...alert,
        currentStock,
        isTriggered
      }
    })

    return NextResponse.json({
      alerts: alertsWithStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching inventory alerts:', error)
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
    const validatedData = createAlertSchema.parse(body)

    // Check if alert already exists for this product/variant
    const existingAlert = await db.inventoryAlert.findFirst({
      where: {
        productId: validatedData.productId || null,
        variantId: validatedData.variantId || null,
        isActive: true
      }
    })

    if (existingAlert) {
      return NextResponse.json(
        { error: 'Alert already exists for this product/variant' },
        { status: 400 }
      )
    }

    // Verify product/variant exists
    if (validatedData.productId) {
      const product = await db.product.findUnique({
        where: { id: validatedData.productId }
      })
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
    }

    if (validatedData.variantId) {
      const variant = await db.variant.findUnique({
        where: { id: validatedData.variantId }
      })
      if (!variant) {
        return NextResponse.json(
          { error: 'Variant not found' },
          { status: 404 }
        )
      }
    }

    const alert = await db.inventoryAlert.create({
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

    return NextResponse.json(alert, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating inventory alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
