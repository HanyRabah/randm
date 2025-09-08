import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const addToWishlistSchema = z.object({
  productId: z.string()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wishlistItems = await db.wishlist.findMany({
      where: {
        OR: [
          { userId: (session.user as any).id },
          { customer: { email: session.user.email } }
        ]
      },
      include: {
        product: {
          include: {
            category: {
              select: { name: true, slug: true }
            },
            media: {
              where: { variantId: null },
              orderBy: { position: 'asc' },
              take: 1
            },
            variants: {
              include: {
                options: {
                  include: {
                    option: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const transformedItems = wishlistItems.map((item: any) => ({
      id: item.id,
      addedAt: item.createdAt.toISOString(),
      product: {
        id: item.product.id,
        title: item.product.title,
        slug: item.product.slug,
        basePrice: Number(item.product.basePrice),
        comparePrice: item.product.comparePrice ? Number(item.product.comparePrice) : null,
        category: item.product.category,
        image: item.product.media[0]?.url || '/placeholder-product.jpg',
        inStock: item.product.variants.some((v: any) => v.inventory > 0),
        variants: item.product.variants.length,
        colors: item.product.variants
          .flatMap((v: any) => v.options.filter((o: any) => o.option.name === 'Color').map((o: any) => o.value))
          .filter((value: any, index: any, self: any) => self.indexOf(value) === index)
      }
    }))

    return NextResponse.json({
      items: transformedItems,
      count: transformedItems.length
    })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId } = addToWishlistSchema.parse(body)

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true, status: true }
    })

    if (!product || product.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if already in wishlist
    const existingWishlistItem = await db.wishlist.findFirst({
      where: {
        productId,
        OR: [
          { userId: session.user.id },
          { customer: { email: session.user.email } }
        ]
      }
    })

    if (existingWishlistItem) {
      return NextResponse.json({ error: 'Product already in wishlist' }, { status: 409 })
    }

    // Add to wishlist
    let wishlistItem
    if ((session.user as any).id) {
      // For authenticated users
      wishlistItem = await db.wishlist.create({
        data: {
          userId: (session.user as any).id,
          productId
        }
      })
    } else {
      // For customers (guest checkout users)
      const customer = await db.customer.findUnique({
        where: { email: session.user.email }
      })

      if (customer) {
        wishlistItem = await db.wishlist.create({
          data: {
            customerId: customer.id,
            productId
          }
        })
      } else {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist',
      wishlistItem: {
        id: wishlistItem.id,
        productId: wishlistItem.productId,
        addedAt: wishlistItem.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    )
  }
}
