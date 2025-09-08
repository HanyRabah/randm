'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { calculatePricing } from '@/lib/pricing'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils/price'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    title: string
    media: Array<{
      url: string
      altText?: string
    }>
  }
  variant?: {
    id: string
    price: number
    options: Array<{
      id: string
      value: string
      option: {
        name: string
      }
    }>
  }
}

interface CheckoutSummaryProps {
  items: CartItem[]
  appliedCoupon?: {
    id: string
    code: string
    type: 'PERCENT' | 'FIXED' | 'FREESHIP'
    value: number
  }
}

export function CheckoutSummary({ items, appliedCoupon }: CheckoutSummaryProps) {
  // Transform cart items to pricing format
  const pricingItems = items.map(item => ({
    id: item.id,
    productId: item.product.id,
    variantId: item.variant?.id,
    quantity: item.quantity,
    price: item.variant?.price || 0,
    title: item.product.title,
    variantTitle: item.variant ? 'Variant' : undefined,
  }))

  const pricing = calculatePricing(pricingItems, appliedCoupon)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                {item.product.media[0] ? (
                  <Image
                    src={item.product.media[0].url}
                    alt={item.product.media[0].altText || item.product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No image</span>
                  </div>
                )}
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {item.quantity}
                </Badge>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.product.title}</p>
                {item.variant?.options && item.variant.options.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {item.variant.options.map(opt => opt.value).join(', ')}
                  </p>
                )}
              </div>
              
              <div className="text-sm font-medium">
                {formatPrice((item.variant?.price || 0) * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(pricing.subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>
              {pricing.shippingCost === 0 ? (
                <Badge variant="secondary" className="text-xs">FREE</Badge>
              ) : (
                formatPrice(pricing.shippingCost)
              )}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>{formatPrice(pricing.taxAmount)}</span>
          </div>
          
          {appliedCoupon && pricing.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Discount ({appliedCoupon.code})</span>
              <span className="text-green-600">-{formatPrice(pricing.discountAmount)}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(pricing.total)}</span>
        </div>

        {/* Payment Method */}
        <div className="bg-muted p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">💰</span>
            <span className="font-medium text-sm">Cash on Delivery</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pay {formatPrice(pricing.total)} when your order arrives
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
