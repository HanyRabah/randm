import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateCouponSchema = z.object({
  code: z.string().min(1).max(50),
  type: z.enum(['PERCENT', 'FIXED', 'FREESHIP']),
  value: z.number().min(0),
  minSubtotal: z.number().min(0).optional(),
  maxRedemptions: z.number().int().min(1).optional(),
  perCustomer: z.number().int().min(1),
  startsAt: z.string(),
  endsAt: z.string().optional(),
  isActive: z.boolean(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const coupon = await db.coupon.findUnique({
      where: { id: params.id },
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupon' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateCouponSchema.parse(body)

    // Check if coupon exists
    const existingCoupon = await db.coupon.findUnique({
      where: { id: params.id },
    })

    if (!existingCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // Check if code is unique (excluding current coupon)
    if (validatedData.code !== existingCoupon.code) {
      const existingCode = await db.coupon.findFirst({
        where: {
          code: validatedData.code,
          id: { not: params.id },
        },
      })

      if (existingCode) {
        return NextResponse.json(
          { error: 'Coupon code already exists' },
          { status: 400 }
        )
      }
    }

    // Validate dates
    const startsAt = new Date(validatedData.startsAt)
    const endsAt = validatedData.endsAt ? new Date(validatedData.endsAt) : null

    if (endsAt && endsAt <= startsAt) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Validate value based on type
    if (validatedData.type === 'PERCENT' && validatedData.value > 100) {
      return NextResponse.json(
        { error: 'Percentage discount cannot exceed 100%' },
        { status: 400 }
      )
    }

    if (validatedData.type === 'FREESHIP') {
      validatedData.value = 0 // Free shipping has no value
    }

    // Update coupon
    const updatedCoupon = await db.coupon.update({
      where: { id: params.id },
      data: {
        code: validatedData.code,
        type: validatedData.type,
        value: validatedData.value,
        minSubtotal: validatedData.minSubtotal,
        maxRedemptions: validatedData.maxRedemptions,
        perCustomer: validatedData.perCustomer,
        startsAt,
        endsAt,
        isActive: validatedData.isActive,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedCoupon)
  } catch (error) {
    console.error('Error updating coupon:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if coupon exists
    const existingCoupon = await db.coupon.findUnique({
      where: { id: params.id },
    })

    if (!existingCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // Check if coupon has been used
    if (existingCoupon.usageCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete coupon that has been used' },
        { status: 400 }
      )
    }

    // Delete coupon
    await db.coupon.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Coupon deleted successfully' })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    )
  }
}
