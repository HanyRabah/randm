import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import { getOrderByNumber } from '@/server/queries/orders'
import { OrderTracker } from '@/components/order/order-tracker'
import { OrderDetails } from '@/components/order/order-details'
import { OTPVerification } from '@/components/order/otp-verification'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { formatPrice } from '@/lib/utils/price'

interface OrderTrackingPageProps {
  params: {
    orderNumber: string
  }
}

export async function generateMetadata({ params }: OrderTrackingPageProps): Promise<Metadata> {
  return {
    title: `Track Order ${params.orderNumber}`,
    description: `Track your order ${params.orderNumber} and see real-time delivery status.`,
  }
}

async function OrderTrackingContent({ orderNumber }: { orderNumber: string }) {
  const order = await getOrderByNumber(orderNumber)

  if (!order) {
    notFound()
  }

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Track Order', href: `/track/${orderNumber}` },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="mt-6">
        <h1 className="text-3xl font-bold mb-2">Order Tracking</h1>
        <p className="text-muted-foreground mb-8">
          Order #{order.orderNumber}
        </p>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* OTP Verification if needed */}
            {!order.otpVerified && (
              <OTPVerification 
                orderNumber={order.orderNumber}
                phone={order.contactPhone}
              />
            )}

            {/* Order Status Tracker */}
            <OrderTracker 
              status={order.status}
              otpVerified={order.otpVerified}
              codCollected={order.codCollected}
              createdAt={order.createdAt}
              updatedAt={order.updatedAt}
            />

            {/* Order Items */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                    {item.product.media[0] && (
                      <Image
                        src={item.product.media[0].url}
                        alt={item.product.title}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.title}</h3>
                      {item.variantTitle && (
                        <p className="text-sm text-muted-foreground">{item.variantTitle}</p>
                      )}
                      <p className="text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderDetails order={order as any} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <OrderTrackingContent orderNumber={params.orderNumber} />
    </Suspense>
  )
}
