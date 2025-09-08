import { describe, it, expect, beforeEach } from 'vitest'
import { validateCoupon, applyCoupon } from '@/lib/coupons'

describe('Coupon Engine', () => {
  const mockCoupon = {
    id: '1',
    code: 'TEST20',
    type: 'PERCENT' as const,
    value: 20,
    minSubtotal: 100,
    maxRedemptions: 10,
    perCustomer: 1,
    usageCount: 5,
    startsAt: new Date('2025-01-01'),
    endsAt: new Date('2025-12-31'),
    isActive: true
  }

  describe('validateCoupon', () => {
    it('should validate a valid coupon', () => {
      const result = validateCoupon(mockCoupon, 150, 'user@test.com', 0)
      
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject inactive coupon', () => {
      const inactiveCoupon = { ...mockCoupon, isActive: false }
      const result = validateCoupon(inactiveCoupon, 150, 'user@test.com', 0)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Coupon is not active')
    })

    it('should reject coupon below minimum subtotal', () => {
      const result = validateCoupon(mockCoupon, 50, 'user@test.com', 0)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Minimum order amount not met')
    })

    it('should reject expired coupon', () => {
      const expiredCoupon = { ...mockCoupon, endsAt: new Date('2024-01-01') }
      const result = validateCoupon(expiredCoupon, 150, 'user@test.com', 0)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Coupon has expired')
    })

    it('should reject coupon not yet started', () => {
      const futureCoupon = { ...mockCoupon, startsAt: new Date('2026-01-01') }
      const result = validateCoupon(futureCoupon, 150, 'user@test.com', 0)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Coupon is not yet active')
    })

    it('should reject coupon at usage limit', () => {
      const maxedCoupon = { ...mockCoupon, maxRedemptions: 5, usageCount: 5 }
      const result = validateCoupon(maxedCoupon, 150, 'user@test.com', 0)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Coupon usage limit reached')
    })

    it('should reject coupon at per-customer limit', () => {
      const result = validateCoupon(mockCoupon, 150, 'user@test.com', 1)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Customer usage limit reached')
    })
  })

  describe('applyCoupon', () => {
    it('should apply percentage discount correctly', () => {
      const result = applyCoupon(mockCoupon, 200)
      
      expect(result.discount).toBe(40) // 20% of 200
      expect(result.finalTotal).toBe(160)
    })

    it('should apply fixed discount correctly', () => {
      const fixedCoupon = { ...mockCoupon, type: 'FIXED' as const, value: 25 }
      const result = applyCoupon(fixedCoupon, 200)
      
      expect(result.discount).toBe(25)
      expect(result.finalTotal).toBe(175)
    })

    it('should apply free shipping correctly', () => {
      const freeShipCoupon = { ...mockCoupon, type: 'FREESHIP' as const }
      const result = applyCoupon(freeShipCoupon, 200, 15)
      
      expect(result.discount).toBe(15) // Shipping cost
      expect(result.finalTotal).toBe(200) // Subtotal unchanged, shipping removed
    })

    it('should not exceed subtotal for fixed discount', () => {
      const largeCoupon = { ...mockCoupon, type: 'FIXED' as const, value: 300 }
      const result = applyCoupon(largeCoupon, 200)
      
      expect(result.discount).toBe(200) // Capped at subtotal
      expect(result.finalTotal).toBe(0)
    })

    it('should handle zero shipping for free shipping coupon', () => {
      const freeShipCoupon = { ...mockCoupon, type: 'FREESHIP' as const }
      const result = applyCoupon(freeShipCoupon, 200, 0)
      
      expect(result.discount).toBe(0)
      expect(result.finalTotal).toBe(200)
    })
  })
})
