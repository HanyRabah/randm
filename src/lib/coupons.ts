import { db } from './db'
import { redis } from './redis'
import { CouponType } from '@prisma/client'

export interface CouponValidationResult {
  valid: boolean
  coupon?: {
    id: string
    code: string
    type: CouponType
    value: number
    minSubtotal?: number
  }
  error?: string
}

export async function validateCoupon(
  code: string,
  subtotal: number,
  customerIdentifier?: string
): Promise<CouponValidationResult> {
  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase() },
  })

  if (!coupon) {
    return { valid: false, error: 'Coupon not found' }
  }

  if (!coupon.isActive) {
    return { valid: false, error: 'Coupon is not active' }
  }

  // Check date validity
  const now = new Date()
  if (coupon.startsAt && now < coupon.startsAt) {
    return { valid: false, error: 'Coupon is not yet active' }
  }

  if (coupon.endsAt && now > coupon.endsAt) {
    return { valid: false, error: 'Coupon has expired' }
  }

  // Check minimum subtotal
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal.toNumber()) {
    return {
      valid: false,
      error: `Minimum order amount is ${coupon.minSubtotal}`,
    }
  }

  // Check global usage limit
  if (coupon.maxRedemptions && coupon.usageCount >= coupon.maxRedemptions) {
    return { valid: false, error: 'Coupon usage limit exceeded' }
  }

  // Check per-customer usage limit
  if (customerIdentifier && coupon.perCustomer) {
    const customerUsage = await getCustomerCouponUsage(coupon.id, customerIdentifier)
    if (customerUsage >= coupon.perCustomer) {
      return { valid: false, error: 'You have already used this coupon' }
    }
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toNumber(),
      minSubtotal: coupon.minSubtotal?.toNumber(),
    },
  }
}

export async function getCustomerCouponUsage(
  couponId: string,
  customerIdentifier: string
): Promise<number> {
  const usage = await db.order.count({
    where: {
      couponId,
      OR: [
        { contactPhone: customerIdentifier },
        { customer: { email: customerIdentifier } },
      ],
    },
  })

  return usage
}

export async function incrementCouponUsage(couponId: string): Promise<void> {
  await db.coupon.update({
    where: { id: couponId },
    data: { usageCount: { increment: 1 } },
  })
}
