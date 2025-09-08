import { NextRequest, NextResponse } from 'next/server'
import { addToCart } from '@/server/actions/cart'
import { z } from 'zod'

const addToCartSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().min(1).default(1)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = addToCartSchema.parse(body)

    // Create FormData to match the server action signature
    const formData = new FormData()
    formData.append('productId', validatedData.productId)
    if (validatedData.variantId) {
      formData.append('variantId', validatedData.variantId)
    }
    formData.append('quantity', validatedData.quantity.toString())

    const result = await addToCart(formData)

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Item added to cart' })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}
