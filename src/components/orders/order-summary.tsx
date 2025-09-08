'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Receipt, CreditCard } from 'lucide-react'

interface OrderSummaryProps {
  order: {
    orderNumber: string
    status: string
    total: number
    subtotal: number
    shippingCost: number
    taxAmount: number
    discountAmount: number
    createdAt: string
  }
}

const statusConfig = {
  PENDING: { label: 'Order Placed', variant: 'secondary' as const },
  CONFIRMED: { label: 'Confirmed', variant: 'default' as const },
  PACKED: { label: 'Packed', variant: 'default' as const },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', variant: 'default' as const },
  DELIVERED: { label: 'Delivered', variant: 'default' as const },
  FAILED: { label: 'Delivery Failed', variant: 'destructive' as const },
  CANCELED: { label: 'Canceled', variant: 'secondary' as const }
}

export function OrderSummary({ order }: OrderSummaryProps) {
  const statusInfo = statusConfig[order.status as keyof typeof statusConfig]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Receipt className="h-5 w-5" />
          <span>Order Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Status */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Status</span>
          <Badge variant={statusInfo.variant}>
            {statusInfo.label}
          </Badge>
        </div>

        <Separator />

        {/* Order Totals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span>EGP {order.subtotal.toFixed(2)}</span>
          </div>
          
          {order.shippingCost > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span>Shipping</span>
              <span>EGP {order.shippingCost.toFixed(2)}</span>
            </div>
          )}
          
          {order.taxAmount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span>Tax</span>
              <span>EGP {order.taxAmount.toFixed(2)}</span>
            </div>
          )}
          
          {order.discountAmount > 0 && (
            <div className="flex items-center justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-EGP {order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex items-center justify-between font-medium text-lg">
            <span>Total</span>
            <span>EGP {order.total.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        {/* Payment Method */}
        <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">Cash on Delivery</p>
            <p className="text-xs text-muted-foreground">
              Pay when you receive your order
            </p>
          </div>
        </div>

        {/* Order Date */}
        <div className="text-xs text-muted-foreground">
          Order placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </CardContent>
    </Card>
  )
}
