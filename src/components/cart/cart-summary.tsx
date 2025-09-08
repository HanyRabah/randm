'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Truck, Tag, X } from 'lucide-react'
import { calculatePricing } from '@/lib/pricing'
import { applyCoupon, removeCoupon } from '@/server/actions/coupons'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    title: string
  }
  variant?: {
    id: string
    price: number | any
  } | null
}

interface CartSummaryProps {
  items: CartItem[]
  appliedCoupon?: {
    id: string
    code: string
    type: 'PERCENT' | 'FIXED' | 'FREESHIP'
    value: number
  }
}

export function CartSummary({ items, appliedCoupon }: CartSummaryProps) {
  const { toast } = useToast()
  const [couponCode, setCouponCode] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [isRemovingCoupon, setIsRemovingCoupon] = useState(false)

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setIsApplyingCoupon(true)

    const formData = new FormData()
    formData.append('code', couponCode.trim().toUpperCase())
    formData.append('subtotal', pricing.subtotal.toString())

    try {
      const result = await applyCoupon(formData)
      
      if (result.success) {
        toast({
          title: 'Coupon applied',
          description: `${couponCode.toUpperCase()} has been applied to your order`,
        })
        setCouponCode('')
      } else {
        toast({
          title: 'Invalid coupon',
          description: result.error || 'This coupon is not valid',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply coupon',
        variant: 'destructive',
      })
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = async () => {
    if (!appliedCoupon) return

    setIsRemovingCoupon(true)

    try {
      const result = await removeCoupon()
      
      if (result.success) {
        toast({
          title: 'Coupon removed',
          description: 'Coupon has been removed from your order',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to remove coupon',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove coupon',
        variant: 'destructive',
      })
    } finally {
      setIsRemovingCoupon(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span>Subtotal ({items.length} items)</span>
          <span>${pricing.subtotal.toFixed(2)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Shipping</span>
          </div>
          <span>
            {pricing.shippingCost === 0 ? (
              <Badge variant="secondary">FREE</Badge>
            ) : (
              `$${pricing.shippingCost.toFixed(2)}`
            )}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${pricing.taxAmount.toFixed(2)}</span>
        </div>

        {/* Applied Coupon */}
        {appliedCoupon && (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Coupon ({appliedCoupon.code})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">-${pricing.discountAmount.toFixed(2)}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveCoupon}
                disabled={isRemovingCoupon}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${pricing.total.toFixed(2)}</span>
        </div>

        {/* Coupon Code Input */}
        {!appliedCoupon && (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleApplyCoupon()
                  }
                }}
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || isApplyingCoupon}
                variant="outline"
              >
                {isApplyingCoupon ? 'Applying...' : 'Apply'}
              </Button>
            </div>
          </div>
        )}

        {/* Free Shipping Notice */}
        {pricing.shippingCost > 0 && pricing.subtotal < 500 && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <Truck className="h-4 w-4 inline mr-2" />
            Add ${(500 - pricing.subtotal).toFixed(2)} more for free shipping!
          </div>
        )}

        {/* Checkout Button */}
        <Button asChild size="lg" className="w-full">
          <Link href="/checkout">
            Proceed to Checkout
          </Link>
        </Button>

        {/* COD Notice */}
        <div className="text-sm text-muted-foreground text-center">
          <p>💰 Cash on Delivery Available</p>
          <p>Pay when you receive your order</p>
        </div>
      </CardContent>
    </Card>
  )
}
