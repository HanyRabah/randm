import { NextRequest, NextResponse } from 'next/server'
import { updateCartItem } from '@/server/actions/cart'
import { z } from 'zod'

const updateCartSchema = z.object({
  itemId: z.string(),
  quantity: z.number().min(0)
})

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = updateCartSchema.parse(body)

    // Create FormData to match the server action signature
    const formData = new FormData()
    formData.append('quantity', validatedData.quantity.toString())

    const result = await updateCartItem(validatedData.itemId, formData)

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Cart updated' })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating cart:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}
