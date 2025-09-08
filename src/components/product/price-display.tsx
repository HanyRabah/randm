'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils/price'

interface PriceDisplayProps {
  price: number | string
  comparePrice?: number | string
  currency?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function PriceDisplay({ 
  price, 
  comparePrice, 
  currency, // Deprecated - now uses EGP formatting
  size = 'md',
  className 
}: PriceDisplayProps) {
  // Convert string prices to numbers
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  const numComparePrice = typeof comparePrice === 'string' ? parseFloat(comparePrice) : comparePrice
  
  const hasDiscount = numComparePrice && numComparePrice > numPrice
  const discountPercentage = hasDiscount 
    ? calculateDiscountPercentage(numComparePrice, numPrice)
    : 0

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  }

  const compareSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  }

  return (
    <div className={cn("flex items-center gap-3 flex-wrap", className)}>
      {/* Current Price */}
      <span className={cn(
        "font-bold text-primary",
        sizeClasses[size]
      )}>
        {formatPrice(numPrice)}
      </span>

      {/* Compare Price & Discount */}
      {hasDiscount && numComparePrice && (
        <>
          <span className={cn(
            "text-muted-foreground line-through",
            compareSizeClasses[size]
          )}>
            {formatPrice(numComparePrice)}
          </span>
          <Badge variant="destructive" className="text-xs font-semibold">
            {discountPercentage}% OFF
          </Badge>
        </>
      )}

      {/* Savings Amount */}
      {hasDiscount && numComparePrice && (
        <span className="text-sm text-green-600 font-medium">
          Save {formatPrice(numComparePrice - numPrice)}
        </span>
      )}
    </div>
  )
}
