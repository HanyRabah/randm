'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { checkoutSchema } from '@/lib/validations'
import { getCart, clearCart } from './cart'
import { getAppliedCoupon } from './coupons'
import { calculatePricing } from '@/lib/pricing'
import { incrementCouponUsage } from '@/lib/coupons'
import { sendOTP } from '@/lib/otp'
import { rateLimit } from '@/lib/redis'

export async function createOrder(formData: FormData) {
  try {
    // Rate limiting
    const clientIP = formData.get('clientIP') as string || 'unknown'
    const rateLimitResult = await rateLimit(`checkout:${clientIP}`, 5, 300) // 5 attempts per 5 minutes
    
    if (!rateLimitResult.success) {
      return { success: false, error: 'Too many checkout attempts. Please try again later.' }
    }

    // Validate form data
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      line1: formData.get('line1') as string,
      line2: formData.get('line2') as string || undefined,
      city: formData.get('city') as string,
      state: formData.get('state') as string || formData.get('region') as string,
      country: formData.get('country') as string,
    }

    const validatedData = checkoutSchema.parse(data)
    const requireOTP = formData.get('requireOTP') === 'true'

    // Get cart and applied coupon
    const [cart, appliedCoupon] = await Promise.all([
      getCart(),
      getAppliedCoupon(),
    ])

    if (!cart || cart.items.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    // Transform cart items for pricing calculation
    const pricingItems = cart.items.map((item: any) => ({
      id: item.id,
      productId: item.product.id,
      variantId: item.variant?.id,
      quantity: item.quantity,
      price: Number(item.variant?.price) || 0,
      title: item.product.title,
      variantTitle: item.variant ? 'Variant' : undefined,
    }))

    const pricing = calculatePricing(pricingItems, appliedCoupon)

    // Check inventory availability
    for (const item of cart.items) {
      if (item.variant && item.variant.inventory < item.quantity) {
        return { 
          success: false, 
          error: `Insufficient inventory for ${item.product.title}` 
        }
      }
    }

    // Create or get customer
    // ponytail: findFirst — email is composite unique (tenantId,email); extension scopes tenantId
    let customer = await db.customer.findFirst({
      where: { email: validatedData.email },
    })

    if (!customer) {
      // ponytail: tenantId auto-injected by db.ts extension
      customer = await db.customer.create({
        data: {
          email: validatedData.email,
          phone: validatedData.phone,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
        } as any,
      })
    }

    // Create address
    const address = await db.address.create({
      data: {
        customerId: customer.id,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        line1: validatedData.line1,
        line2: validatedData.line2,
        city: validatedData.city,
        state: validatedData.state,
        country: validatedData.country,
        phone: validatedData.phone,
        isDefault: false,
      },
    })

    // Generate order number
    const orderNumber = `COD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    // Create order
    // ponytail: tenantId auto-injected by db.ts extension
    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        addressId: address.id,
        status: 'PENDING',
        subtotal: pricing.subtotal,
        shippingCost: pricing.shippingCost,
        taxAmount: pricing.taxAmount,
        discountAmount: pricing.discountAmount,
        total: pricing.total,
        couponId: appliedCoupon?.id,
        contactPhone: validatedData.phone,
        otpVerified: !requireOTP, // If OTP not required, mark as verified
        codCollected: false,
      } as any,
    })

    // Create order items and update inventory
    for (const item of cart.items) {
      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.product.id,
          variantId: item.variant?.id,
          quantity: item.quantity,
          price: item.variant?.price || 0,
          title: item.product.title,
          variantTitle: item.variant?.options?.map((o: any) => o.value).join(', '),
        },
      })

      // Update inventory
      if (item.variant) {
        await db.variant.update({
          where: { id: item.variant.id },
          data: { inventory: { decrement: item.quantity } },
        })
      }
    }

    // Update customer stats
    await db.customer.update({
      where: { id: customer.id },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: pricing.total },
      },
    })

    // Increment coupon usage
    if (appliedCoupon) {
      await incrementCouponUsage(appliedCoupon.id)
    }

    // Send OTP if required
    if (requireOTP) {
      const otpResult = await sendOTP(validatedData.phone)
      if (!otpResult) {
        // Order created but OTP failed - still return success
        console.error('OTP send failed')
      }
    }

    // Clear cart and coupon
    await clearCart()
    const cookieStore = cookies()
    cookieStore.delete('applied-coupon')

    return { 
      success: true, 
      orderId: order.id,
      orderNumber: order.orderNumber,
      requireOTP 
    }
  } catch (error) {
    console.error('Create order error:', error)
    return { success: false, error: 'Failed to create order' }
  }
}
