'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { formatPrice } from '@/lib/utils/price'
import { useCart } from '@/contexts/cart-context'
import { WishlistButton } from '@/components/wishlist/wishlist-button'
import { StarRatingDisplay } from '@/components/reviews/star-rating'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ProductCardProps {
  product: {
    id: string
    title: string
    slug: string
    basePrice: number
    comparePrice: number | null
    category: { name: string; slug: string }
    image: string
    inStock: boolean
    variants: number
    colors?: string[]
    averageRating?: number
    totalReviews?: number
  }
  viewMode?: 'grid' | 'list'
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsAddingToCart(true)
    try {
      await addToCart(product.id, '1')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const discountPercentage = product.comparePrice 
    ? Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100)
    : 0

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardContent className="p-0">
          <Link href={`/product/${product.slug}`}>
            <div className="flex">
              {/* Image */}
              <div className="relative w-48 h-48 flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover rounded-l-lg"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-l-lg">
                    <Badge variant="secondary" className="bg-red-500 text-white">
                      Out of Stock
                    </Badge>
                  </div>
                )}
                {discountPercentage > 0 && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    -{discountPercentage}%
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Badge variant="outline" className="mb-2 text-xs">
                      {product.category.name}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-amber-600 transition-colors">
                      {product.title}
                    </h3>
                  </div>
                  <WishlistButton
                    productId={product.id}
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                {/* Rating */}
                {product.averageRating && product.totalReviews !== undefined && (
                  <div className="mb-3">
                    <StarRatingDisplay
                      rating={product.averageRating}
                      totalReviews={product.totalReviews}
                      size="sm"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl font-bold text-amber-600">
                    {formatPrice(product.basePrice)}
                  </span>
                  {product.comparePrice && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>

                {product.colors && product.colors.length > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm text-gray-600">Colors:</span>
                    <div className="flex space-x-1">
                      {product.colors.slice(0, 4).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      ))}
                      {product.colors.length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{product.colors.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddToCart}
                      disabled={!product.inStock || isAddingToCart}
                    >
                      {isAddingToCart ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Quick View
                    </Button>
                  </div>
                  {product.variants > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      {product.variants} variants
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <Link href={`/product/${product.slug}`}>
          {/* Image */}
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary" className="bg-red-500 text-white">
                  Out of Stock
                </Badge>
              </div>
            )}
            {discountPercentage > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                -{discountPercentage}%
              </Badge>
            )}
            
            {/* Hover Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <WishlistButton
                productId={product.id}
                variant="secondary"
                className="bg-white/90 hover:bg-white"
              />
            </div>

            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex space-x-2">
                <Button
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAddingToCart}
                >
                  {isAddingToCart ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-white/90 hover:bg-white"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <Badge variant="outline" className="mb-2 text-xs">
              {product.category.name}
            </Badge>
            
            <h3 className="font-semibold mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
              {product.title}
            </h3>

            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex space-x-1">
                  {product.colors.slice(0, 3).map((color, index) => (
                    <div
                      key={index}
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                  {product.colors.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{product.colors.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-amber-600">
                  {formatPrice(product.basePrice)}
                </span>
                {product.comparePrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              {product.variants > 1 && (
                <Badge variant="secondary" className="text-xs">
                  {product.variants} variants
                </Badge>
              )}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
