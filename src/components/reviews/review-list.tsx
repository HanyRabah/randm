'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StarRatingDisplay } from './star-rating'
import { ThumbsUp, ThumbsDown, Verified, ChevronDown, Filter } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  rating: number
  title?: string
  comment?: string
  isVerified: boolean
  helpfulVotes: number
  createdAt: string
  author: {
    name: string
  }
  media: Array<{
    id: string
    url: string
    type: string
  }>
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: Array<{
    rating: number
    count: number
    percentage: number
  }>
}

interface ReviewListProps {
  productId: string
  refreshTrigger?: number
}

export function ReviewList({ productId, refreshTrigger }: ReviewListProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({})
  const [filters, setFilters] = useState({
    rating: 'all',
    sortBy: 'newest'
  })
  const [showAllReviews, setShowAllReviews] = useState(false)

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams({
        limit: showAllReviews ? '50' : '5',
        sortBy: filters.sortBy
      })

      if (filters.rating !== 'all') {
        params.append('rating', filters.rating)
      }

      const response = await fetch(`/api/products/${productId}/reviews?${params}`)
      const data = await response.json()

      if (response.ok) {
        setReviews(data.reviews)
        setStats(data.stats)
      } else {
        console.error('Failed to fetch reviews:', data.error)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId, filters, showAllReviews, refreshTrigger])

  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    if (!session) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to vote on reviews',
        variant: 'destructive'
      })
      return
    }

    setVotingStates(prev => ({ ...prev, [reviewId]: true }))

    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isHelpful })
      })

      const data = await response.json()

      if (response.ok) {
        // Update the review's helpful votes count
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpfulVotes: data.helpfulVotes }
            : review
        ))
        
        toast({
          description: data.voted ? 'Vote recorded' : 'Vote removed'
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to vote',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error voting:', error)
      toast({
        title: 'Error',
        description: 'Failed to vote on review',
        variant: 'destructive'
      })
    } finally {
      setVotingStates(prev => ({ ...prev, [reviewId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="w-4 h-4 bg-gray-200 rounded" />
                    ))}
                  </div>
                  <div className="w-20 h-4 bg-gray-200 rounded" />
                </div>
                <div className="w-3/4 h-4 bg-gray-200 rounded" />
                <div className="space-y-2">
                  <div className="w-full h-3 bg-gray-200 rounded" />
                  <div className="w-2/3 h-3 bg-gray-200 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-3xl font-bold">{stats.averageRating}</span>
                <div>
                  <StarRatingDisplay 
                    rating={stats.averageRating} 
                    showText={false}
                    size="lg"
                  />
                  <p className="text-sm text-gray-600">
                    Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {stats.ratingDistribution.map((dist) => (
                <div key={dist.rating} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{dist.rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-600">{dist.count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Filter by:</span>
        </div>
        
        <Select value={filters.rating} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stars</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="rating_high">Highest Rated</SelectItem>
            <SelectItem value="rating_low">Lowest Rated</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <StarRatingDisplay 
                        rating={review.rating} 
                        showText={false}
                      />
                      <span className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                      {review.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          <Verified className="w-3 h-3 mr-1" />
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">{review.author.name}</p>
                  </div>
                </div>

                {/* Review Content */}
                {review.title && (
                  <h4 className="font-semibold text-gray-900">{review.title}</h4>
                )}
                
                {review.comment && (
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                )}

                {/* Review Media */}
                {review.media.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {review.media.map((media) => (
                      <div key={media.id} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        {media.type === 'image' ? (
                          <img 
                            src={media.url} 
                            alt="Review media"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            Video
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center gap-4 pt-2 border-t">
                  <span className="text-sm text-gray-600">Was this helpful?</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(review.id, true)}
                      disabled={votingStates[review.id]}
                      className="text-gray-600 hover:text-green-600"
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Yes
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(review.id, false)}
                      disabled={votingStates[review.id]}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      No
                    </Button>
                  </div>
                  {review.helpfulVotes > 0 && (
                    <span className="text-sm text-gray-500">
                      {review.helpfulVotes} people found this helpful
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {!showAllReviews && stats.totalReviews > 5 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAllReviews(true)}
            className="gap-2"
          >
            <ChevronDown className="w-4 h-4" />
            Show All {stats.totalReviews} Reviews
          </Button>
        </div>
      )}
    </div>
  )
}
