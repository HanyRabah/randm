import { CouponType } from '@prisma/client'

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  quantity: number
  price: number
  title: string
  variantTitle?: string
}

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  minSubtotal?: number
}

export interface PricingCalculation {
  subtotal: number
  shippingCost: number
  taxAmount: number
  discountAmount: number
  total: number
  couponApplied?: Coupon
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function calculateShipping(
  subtotal: number,
  items: CartItem[],
  freeShippingThreshold = 500
): number {
  if (subtotal >= freeShippingThreshold) {
    return 0
  }
  
  // Base shipping cost
  const baseShipping = 50
  
  // Additional cost per item
  const perItemCost = 10
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  
  return baseShipping + (totalItems - 1) * perItemCost
}

export function calculateTax(subtotal: number, taxRate = 0.14): number {
  return subtotal * taxRate
}

export function calculateDiscount(
  subtotal: number,
  shippingCost: number,
  coupon?: Coupon
): number {
  if (!coupon) return 0

  switch (coupon.type) {
    case 'PERCENT':
      return subtotal * (coupon.value / 100)
    case 'FIXED':
      return Math.min(coupon.value, subtotal)
    case 'FREESHIP':
      return shippingCost
    default:
      return 0
  }
}

export function calculatePricing(
  items: CartItem[],
  coupon?: Coupon
): PricingCalculation {
  const subtotal = calculateSubtotal(items)
  const shippingCost = calculateShipping(subtotal, items)
  const taxAmount = calculateTax(subtotal)
  const discountAmount = calculateDiscount(subtotal, shippingCost, coupon)
  
  const total = Math.max(0, subtotal + shippingCost + taxAmount - discountAmount)

  return {
    subtotal,
    shippingCost,
    taxAmount,
    discountAmount,
    total,
    couponApplied: coupon,
  }
}
