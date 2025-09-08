'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface OrderDetailsProps {
  order: any
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PACKED: 'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELED: 'bg-gray-100 text-gray-800',
}

export function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Info */}
        <div>
          <h3 className="font-medium mb-3">Order Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Number:</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                {order.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Date:</span>
              <span>{order.createdAt.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment:</span>
              <span>Cash on Delivery</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Customer Info */}
        <div>
          <h3 className="font-medium mb-3">Customer Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span>{order.customer.firstName} {order.customer.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{order.customer.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span>{order.contactPhone}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Delivery Address */}
        <div>
          <h3 className="font-medium mb-3">Delivery Address</h3>
          <div className="text-sm text-muted-foreground">
            <p>{order.address.firstName} {order.address.lastName}</p>
            <p>{order.address.line1}</p>
            {order.address.line2 && <p>{order.address.line2}</p>}
            <p>{order.address.city}, {order.address.region}</p>
            {order.address.postalCode && <p>{order.address.postalCode}</p>}
            <p>{order.address.country}</p>
            <p className="mt-2 font-medium">Phone: {order.address.phone}</p>
          </div>
        </div>

        <Separator />

        {/* Order Total */}
        <div>
          <h3 className="font-medium mb-3">Order Total</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping:</span>
              <span>${order.shippingCost.toFixed(2)}</span>
            </div>
            {Number(order.taxAmount) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span>${Number(order.taxAmount).toFixed(2)}</span>
              </div>
            )}
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-${order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {order.coupon && (
              <div className="flex justify-between text-green-600">
                <span>Coupon ({order.coupon.code}):</span>
                <span>Applied</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-medium text-base">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* COD Status */}
        {order.status === 'DELIVERED' && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium mb-3">Payment Status</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">COD Collection:</span>
                <Badge className={order.codCollected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {order.codCollected ? 'Collected' : 'Pending'}
                </Badge>
              </div>
            </div>
          </>
        )}

        {/* OTP Status */}
        {!order.otpVerified && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium mb-3">Verification Status</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Phone Verification:</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  Pending
                </Badge>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
