import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().optional(),
  comment: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await db.review.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { name: true }
        },
        customer: {
          select: { firstName: true, lastName: true }
        },
        product: {
          select: { id: true, title: true, slug: true }
        },
        media: {
          orderBy: { position: 'asc' }
        }
      }
    })

    if (!review || !review.isApproved) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const transformedReview = {
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerified: review.isVerified,
      helpfulVotes: review.helpfulVotes,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      author: {
        name: review.user?.name || 
              (review.customer?.firstName && review.customer?.lastName 
                ? `${review.customer.firstName} ${review.customer.lastName}`
                : 'Anonymous')
      },
      product: review.product,
      media: review.media.map((media: any) => ({
        id: media.id,
        url: media.url,
        type: media.type
      }))
    }

    return NextResponse.json({ review: transformedReview })
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updateData = updateReviewSchema.parse(body)

    // Check if review exists and user owns it
    const existingReview = await db.review.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: (session.user as any).id },
          { customer: { email: session.user.email } }
        ]
      }
    })

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 })
    }

    // Update review
    const updatedReview = await db.review.update({
      where: { id: params.id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        title: updatedReview.title,
        comment: updatedReview.comment,
        updatedAt: updatedReview.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating review:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if review exists and user owns it
    const existingReview = await db.review.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: (session.user as any).id },
          { customer: { email: session.user.email } }
        ]
      }
    })

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 })
    }

    // Delete review (this will cascade delete votes and media)
    await db.review.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
