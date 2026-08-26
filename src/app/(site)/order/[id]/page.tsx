import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { OrderStatusTracker } from '@/components/orders/order-status-tracker'
import { OrderItems } from '@/components/orders/order-items'
import { OrderSummary } from '@/components/orders/order-summary'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, Receipt } from 'lucide-react'
import Link from 'next/link'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'

interface OrderPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: OrderPageProps) {
  return await generateSeoMetadata({
    title: `Order #${params.id} - Track Your Order`,
    description: 'Track your furniture order status, shipment details, and delivery information.',
    url: `/order/${params.id}`,
  })
}

async function getOrder(orderId: string, userEmail?: string | null) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              media: {
                orderBy: { position: 'asc' },
                take: 1
              }
            }
          },
          variant: {
            include: {
              options: {
                include: {
                  option: true
                }
              }
            }
          }
        }
      },
      user: {
        select: {
          email: true,
          name: true
        }
      },
      address: true,
      coupon: true
    }
  })

  // Check if user has access to this order
  if (order && userEmail && order.user?.email !== userEmail) {
    return null
  }

  return order
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await getServerSession(authOptions)
  const order = await getOrder(params.id, session?.user?.email)

  if (!order) {
    notFound()
  }

  // Transform order data for components
  const orderData = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    courier: order.courier,
    airwayBill: order.airwayBill,
    trackingUrl: order.trackingUrl,
    estimatedDelivery: order.estimatedDelivery?.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString(),
    contactPhone: order.contactPhone,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    address: order.address ? {
      street: order.address.line1,
      city: order.address.city,
      governorate: order.address.state
    } : undefined,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    taxAmount: Number(order.taxAmount),
    discountAmount: Number(order.discountAmount),
    items: order.items.map((item: any) => ({
      id: item.id,
      productTitle: item.product.title,
      productSlug: item.product.slug,
      variantSku: item.variant?.sku || 'Default',
      quantity: item.quantity,
      price: Number(item.price),
      image: item.product.media[0]?.url || '/placeholder-product.jpg',
      options: item.variant?.options?.map((opt: any) => ({
        name: opt.option.name,
        value: opt.value
      })) || []
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                <Link href="/account/orders">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
                </Link>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-gray-300">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-2">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Receipt className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Status and Tracking */}
            <div className="lg:col-span-2">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-gray-600">Loading order status...</span>
                </div>
              }>
                <OrderStatusTracker order={orderData as any} />
              </Suspense>
            </div>

            {/* Order Summary and Items */}
            <div className="space-y-6">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-gray-600">Loading order details...</span>
                </div>
              }>
                <OrderSummary order={orderData} />
              </Suspense>
              
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-gray-600">Loading order items...</span>
                </div>
              }>
                <OrderItems items={orderData.items} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
