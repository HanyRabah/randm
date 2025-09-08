'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlist } from '@/contexts/wishlist-context'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  variant?: 'default' | 'ghost' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showText?: boolean
}

export function WishlistButton({ 
  productId, 
  variant = 'ghost', 
  size = 'icon',
  className,
  showText = false
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [isLoading, setIsLoading] = useState(false)
  
  const inWishlist = isInWishlist(productId)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsLoading(true)
    try {
      await toggleWishlist(productId)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        'transition-colors',
        inWishlist && 'text-red-500 hover:text-red-600',
        className
      )}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={cn(
          'h-4 w-4',
          showText && 'mr-2',
          inWishlist && 'fill-current'
        )} 
      />
      {showText && (
        <span>
          {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </Button>
  )
}
