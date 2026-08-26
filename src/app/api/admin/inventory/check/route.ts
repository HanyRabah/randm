import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active alerts
    const alerts = await db.inventoryAlert.findMany({
      where: { isActive: true },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            variants: {
              select: {
                id: true,
                inventory: true
              }
            }
          }
        },
        variant: {
          select: {
            id: true,
            sku: true,
            inventory: true,
            product: {
              select: {
                title: true,
                slug: true
              }
            }
          }
        }
      }
    })

    const triggeredAlerts = []
    const now = new Date()

    for (const alert of alerts) {
      let currentStock = 0
      let isTriggered = false

      if (alert.variant) {
        // Variant-specific alert
        currentStock = alert.variant.inventory
        isTriggered = alert.alertType === 'OUT_OF_STOCK' 
          ? currentStock === 0 
          : currentStock <= alert.threshold
      } else if (alert.product) {
        // Product-level alert - sum all variant inventories
        currentStock = alert.product.variants.reduce((sum: number, variant: any) => sum + variant.inventory, 0)
        isTriggered = alert.alertType === 'OUT_OF_STOCK' 
          ? currentStock === 0 
          : currentStock <= alert.threshold
      }

      if (isTriggered) {
        // Check if we should send alert (avoid spam)
        const shouldSendAlert = !alert.lastAlertSent || 
          (now.getTime() - alert.lastAlertSent.getTime()) > (24 * 60 * 60 * 1000) // 24 hours

        if (shouldSendAlert) {
          // Update last alert sent time
          await db.inventoryAlert.update({
            where: { id: alert.id },
            data: { lastAlertSent: now }
          })

          triggeredAlerts.push({
            ...alert,
            currentStock,
            isTriggered
          })
        }
      }
    }

    // In a real implementation, you would send emails/notifications here
    // For now, we'll just return the triggered alerts

    return NextResponse.json({
      message: `Checked ${alerts.length} alerts, ${triggeredAlerts.length} triggered`,
      triggeredAlerts,
      totalAlerts: alerts.length,
      triggeredCount: triggeredAlerts.length
    })

  } catch (error) {
    console.error('Error checking inventory alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
