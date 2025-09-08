'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { validateCoupon } from '@/lib/coupons'
import { revalidatePath } from 'next/cache'

export async function applyCoupon(formData: FormData) {
  try {
    const code = formData.get('code') as string
    const subtotal = parseFloat(formData.get('subtotal') as string)

    if (!code || !subtotal) {
      return { success: false, error: 'Invalid request' }
    }

    // Validate the coupon
    const validation = await validateCoupon(code, subtotal)
    
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Store coupon in session cookie
    const cookieStore = cookies()
    cookieStore.set('applied-coupon', JSON.stringify(validation.coupon), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    revalidatePath('/cart')
    return { success: true, coupon: validation.coupon }
  } catch (error) {
    console.error('Apply coupon error:', error)
    return { success: false, error: 'Failed to apply coupon' }
  }
}

export async function removeCoupon() {
  try {
    const cookieStore = cookies()
    cookieStore.delete('applied-coupon')

    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Remove coupon error:', error)
    return { success: false, error: 'Failed to remove coupon' }
  }
}

export async function getAppliedCoupon() {
  try {
    const cookieStore = cookies()
    const couponCookie = cookieStore.get('applied-coupon')
    
    if (!couponCookie) {
      return null
    }

    return JSON.parse(couponCookie.value)
  } catch (error) {
    console.error('Get applied coupon error:', error)
    return null
  }
}
