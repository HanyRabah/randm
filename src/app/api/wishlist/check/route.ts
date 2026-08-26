import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const wishlistItem = await db.wishlist.findFirst({
      where: {
        productId,
        OR: [
          { userId: (session.user as any).id },
          { customer: { email: session.user.email } }
        ]
      }
    })

    return NextResponse.json({
      inWishlist: !!wishlistItem,
      wishlistItemId: wishlistItem?.id || null
    })
  } catch (error) {
    console.error('Error checking wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to check wishlist' },
      { status: 500 }
    )
  }
}
