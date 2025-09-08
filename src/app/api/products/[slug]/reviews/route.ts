import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
  orderId: z.string().optional()
})

const reviewsQuerySchema = z.object({
  page: z.string().transform(val => val ? parseInt(val) : 1).optional(),
  limit: z.string().transform(val => val ? parseInt(val) : 10).optional(),
  rating: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  sortBy: z.enum(['newest', 'oldest', 'rating_high', 'rating_low', 'helpful']).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const {
      page = 1,
      limit = 10,
      rating,
      sortBy = 'newest'
    } = reviewsQuerySchema.parse(queryParams)

    // Get product by slug first
    const product = await db.product.findUnique({
      where: { slug: params.slug },
      select: { id: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Build where clause
    const where: any = {
      productId: product.id,
      isApproved: true
    }

    if (rating) {
      where.rating = rating
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' } // default newest

    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'rating_high':
        orderBy = { rating: 'desc' }
        break
      case 'rating_low':
        orderBy = { rating: 'asc' }
        break
      case 'helpful':
        orderBy = { helpfulVotes: 'desc' }
        break
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get reviews and total count
    const [reviews, totalCount, ratingStats] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          user: {
            select: { name: true }
          },
          customer: {
            select: { firstName: true, lastName: true }
          },
          media: {
            orderBy: { position: 'asc' }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.review.count({ where }),
      db.review.groupBy({
        by: ['rating'],
        where: {
          productId: product.id,
          isApproved: true
        },
        _count: {
          rating: true
        }
      })
    ])

    // Calculate average rating and rating distribution
    const totalReviews = ratingStats.reduce((sum: number, stat: any) => sum + stat._count.rating, 0)
    const averageRating = totalReviews > 0 
      ? ratingStats.reduce((sum: number, stat: any) => sum + (stat.rating * stat._count.rating), 0) / totalReviews
      : 0

    const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
      const rating = i + 1
      const stat = ratingStats.find((s: any) => s.rating === rating)
      return {
        rating,
        count: stat?._count.rating || 0,
        percentage: totalReviews > 0 ? ((stat?._count.rating || 0) / totalReviews) * 100 : 0
      }
    }).reverse() // 5 stars first

    // Transform reviews for response
    const transformedReviews = reviews.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerified: review.isVerified,
      helpfulVotes: review.helpfulVotes,
      createdAt: review.createdAt.toISOString(),
      author: {
        name: review.user?.name || 
              (review.customer?.firstName && review.customer?.lastName 
                ? `${review.customer.firstName} ${review.customer.lastName}`
                : 'Anonymous')
      },
      media: review.media.map((media: any) => ({
        id: media.id,
        url: media.url,
        type: media.type
      }))
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      reviews: transformedReviews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
        ratingDistribution
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { rating, title, comment, orderId } = createReviewSchema.parse(body)

    // Check if product exists
    const product = await db.product.findUnique({
      where: { slug: params.slug },
      select: { id: true, title: true, status: true }
    })

    if (!product || product.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if user already reviewed this product
    const existingReview = await db.review.findFirst({
      where: {
        productId: product.id,
        OR: [
          { userId: (session.user as any).id },
          { customer: { email: session.user.email } }
        ]
      }
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 })
    }

    // Verify order if provided
    let isVerified = false
    if (orderId) {
      const order = await db.order.findFirst({
        where: {
          id: orderId,
          status: 'DELIVERED',
          OR: [
            { userId: (session.user as any).id },
            { customer: { email: session.user.email } }
          ],
          items: {
            some: {
              productId: product.id
            }
          }
        }
      })
      isVerified = !!order
    }

    // Create review
    let review
    if ((session.user as any).id) {
      // For authenticated users
      review = await db.review.create({
        data: {
          productId: product.id,
          userId: (session.user as any).id,
          orderId: orderId || null,
          rating,
          title: title || null,
          comment: comment || null,
          isVerified,
          isApproved: true // Auto-approve for now, can add moderation later
        }
      })
    } else {
      // For customers (guest checkout users)
      const customer = await db.customer.findUnique({
        where: { email: session.user.email }
      })

      if (customer) {
        review = await db.review.create({
          data: {
            productId: product.id,
            customerId: customer.id,
            orderId: orderId || null,
            rating,
            title: title || null,
            comment: comment || null,
            isVerified,
            isApproved: true
          }
        })
      } else {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerified: review.isVerified,
        createdAt: review.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error creating review:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
