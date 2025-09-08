import { describe, it, expect } from 'vitest'
import { calculatePricing } from '@/lib/pricing'

describe('Coupon Engine', () => {
  const mockCartItems = [
    {
      id: '1',
      productId: 'prod1',
      quantity: 2,
      price: 50,
      title: 'Test Product 1',
    },
    {
      id: '2',
      productId: 'prod2',
      quantity: 1,
      price: 100,
      title: 'Test Product 2',
    },
  ]

  it('should calculate correct subtotal', () => {
    const pricing = calculatePricing(mockCartItems)
    expect(pricing.subtotal).toBe(200) // (2 * 50) + (1 * 100)
  })

  it('should apply percentage coupon correctly', () => {
    const coupon = {
      id: '1',
      code: 'SAVE10',
      type: 'PERCENT' as const,
      value: 10,
    }
    
    const pricing = calculatePricing(mockCartItems, coupon)
    expect(pricing.discountAmount).toBe(20) // 10% of 200
    expect(pricing.total).toBeLessThan(200)
  })

  it('should apply fixed amount coupon correctly', () => {
    const coupon = {
      id: '2',
      code: 'SAVE50',
      type: 'FIXED' as const,
      value: 50,
    }
    
    const pricing = calculatePricing(mockCartItems, coupon)
    expect(pricing.discountAmount).toBe(50)
  })

  it('should apply free shipping coupon correctly', () => {
    const coupon = {
      id: '3',
      code: 'FREESHIP',
      type: 'FREESHIP' as const,
      value: 0,
    }
    
    const pricing = calculatePricing(mockCartItems, coupon)
    expect(pricing.discountAmount).toBeGreaterThan(0) // Should equal shipping cost
  })

  it('should calculate shipping correctly', () => {
    const pricing = calculatePricing(mockCartItems)
    // Subtotal is 200, which is less than 500 free shipping threshold
    expect(pricing.shippingCost).toBeGreaterThan(0)
  })

  it('should provide free shipping for orders over threshold', () => {
    const largeOrderItems = [
      {
        id: '1',
        productId: 'prod1',
        quantity: 10,
        price: 60,
        title: 'Expensive Product',
      },
    ]
    
    const pricing = calculatePricing(largeOrderItems)
    expect(pricing.subtotal).toBeGreaterThanOrEqual(500)
    expect(pricing.shippingCost).toBe(0)
  })
})
