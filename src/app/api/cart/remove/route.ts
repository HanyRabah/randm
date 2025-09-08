import { NextRequest, NextResponse } from 'next/server'
import { removeFromCart } from '@/server/actions/cart'
import { z } from 'zod'

const removeFromCartSchema = z.object({
  itemId: z.string()
})

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = removeFromCartSchema.parse(body)

    const result = await removeFromCart(validatedData.itemId)

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Item removed from cart' })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error removing from cart:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to remove item from cart' },
      { status: 500 }
    )
  }
}
