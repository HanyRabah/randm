'use client'

import { useState } from 'react'
import { ReviewForm } from './review-form'
import { ReviewList } from './review-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Edit3 } from 'lucide-react'

interface ReviewsSectionProps {
  productId: string
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleReviewSubmitted = () => {
    // Trigger a refresh of the reviews list
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reviews" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="write-review" className="gap-2">
            <Edit3 className="w-4 h-4" />
            Write Review
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews" className="mt-6">
          <ReviewList 
            productId={productId} 
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>
        
        <TabsContent value="write-review" className="mt-6">
          <ReviewForm 
            productSlug={productId}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
