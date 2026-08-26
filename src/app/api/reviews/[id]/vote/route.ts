import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const voteSchema = z.object({
  isHelpful: z.boolean()
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isHelpful } = voteSchema.parse(body)

    // Check if review exists
    const review = await db.review.findUnique({
      where: { id: params.id },
      select: { id: true, helpfulVotes: true }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Check if user already voted on this review
    const existingVote = await db.reviewVote.findFirst({
      where: {
        reviewId: params.id,
        OR: [
          { userId: (session.user as any).id },
          { customer: { email: session.user.email } }
        ]
      }
    })

    let voteResult
    if (existingVote) {
      // Update existing vote
      if (existingVote.isHelpful !== isHelpful) {
        voteResult = await db.reviewVote.update({
          where: { id: existingVote.id },
          data: { isHelpful }
        })
      } else {
        // Same vote, remove it (toggle off)
        await db.reviewVote.delete({
          where: { id: existingVote.id }
        })
        voteResult = null
      }
    } else {
      // Create new vote
      if ((session.user as any).id) {
        voteResult = await db.reviewVote.create({
          data: {
            reviewId: params.id,
            userId: (session.user as any).id,
            isHelpful
          }
        })
      } else {
        // ponytail: findFirst — email is composite unique (tenantId,email)
        const customer = await db.customer.findFirst({
          where: { email: session.user.email }
        })

        if (customer) {
          voteResult = await db.reviewVote.create({
            data: {
              reviewId: params.id,
              customerId: customer.id,
              isHelpful
            }
          })
        } else {
          return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }
      }
    }

    // Update helpful votes count
    const helpfulCount = await db.reviewVote.count({
      where: {
        reviewId: params.id,
        isHelpful: true
      }
    })

    await db.review.update({
      where: { id: params.id },
      data: { helpfulVotes: helpfulCount }
    })

    return NextResponse.json({
      success: true,
      voted: !!voteResult,
      isHelpful: voteResult?.isHelpful || null,
      helpfulVotes: helpfulCount
    })
  } catch (error) {
    console.error('Error voting on review:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to vote on review' },
      { status: 500 }
    )
  }
}
