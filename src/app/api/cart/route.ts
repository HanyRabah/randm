import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCart } from '@/server/actions/cart'

export async function GET() {
  try {
    const cart = await getCart()
    
    if (!cart) {
      return NextResponse.json({ items: [], total: 0, itemCount: 0 })
    }

    // Calculate totals
    const total = cart.items.reduce((sum: number, item: any) => {
      const variant = item.variant
      const price = variant?.price || item.product.basePrice
      return sum + (Number(price) * item.quantity)
    }, 0)

    const itemCount = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0)

    // Transform cart items for frontend
    const transformedItems = cart.items.map((item: any) => {
      const variant = item.variant
      const price = variant?.price || item.product.basePrice
      const image = item.product.media[0]?.url || '/placeholder-product.jpg'
      
      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productTitle: item.product.title,
        productSlug: item.product.slug,
        variantTitle: variant?.sku || 'Default',
        price: Number(price),
        quantity: item.quantity,
        image,
        options: variant?.options?.map((opt: any) => ({
          name: opt.option.name,
          value: opt.value
        })) || []
      }
    })

    return NextResponse.json({
      items: transformedItems,
      total: Number(total.toFixed(2)),
      itemCount
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}
