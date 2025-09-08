'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Heart } from 'lucide-react'
import { addToCart } from '@/server/actions/cart'
import { useToast } from '@/components/ui/use-toast'
import { formatPrice } from '@/lib/utils/price'

interface Product {
  id: string
  title: string
  slug: string
  basePrice: number | any
  compareAtPrice?: number | any
  comparePrice?: number | any
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'PUBLISHED'
  category?: any
  media: Array<{
    url: string
    altText?: string | null
  }>
  variants: Array<{
    id: string
    price: number | any
    inventory: number
    isDefault?: boolean
  }>
}

interface ProductGridProps {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function ProductGrid({ products, pagination }: ProductGridProps) {
  const { toast } = useToast()
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(new Set())

  const handleAddToCart = async (product: Product) => {
    const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0]
    if (!defaultVariant) return

    setLoadingProducts(prev => new Set(prev).add(product.id))

    const formData = new FormData()
    formData.append('productId', product.id)
    formData.append('variantId', defaultVariant.id)
    formData.append('quantity', '1')

    try {
      const result = await addToCart(formData)
      
      if (result.success) {
        toast({
          title: 'Added to cart',
          description: `${product.title} has been added to your cart.`,
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add item to cart',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      })
    } finally {
      setLoadingProducts(prev => {
        const newSet = new Set(prev)
        newSet.delete(product.id)
        return newSet
      })
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground">No products found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your filters or search terms.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0]
          const isOutOfStock = !defaultVariant || defaultVariant.inventory === 0
          const isLoading = loadingProducts.has(product.id)
          const hasDiscount = product.comparePrice && product.comparePrice > product.basePrice

          return (
            <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-square overflow-hidden">
                <Link href={`/product/${product.slug}`}>
                  {product.media[0] ? (
                    <Image
                      src={product.media[0].url}
                      alt={product.media[0].altText || product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </Link>
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {hasDiscount && (
                    <Badge variant="destructive" className="text-xs">
                      {Math.round(((product.comparePrice! - product.basePrice) / product.comparePrice!) * 100)}% OFF
                    </Badge>
                  )}
                  {isOutOfStock && (
                    <Badge variant="secondary" className="text-xs">
                      Out of Stock
                    </Badge>
                  )}
                </div>

                {/* Wishlist Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-muted-foreground">
                    {product.category.name}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      {formatPrice(defaultVariant?.price || product.basePrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={isOutOfStock || isLoading}
                  className="w-full"
                  size="sm"
                >
                  {isLoading ? (
                    'Adding...'
                  ) : isOutOfStock ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            asChild={pagination.page > 1}
          >
            {pagination.page > 1 ? (
              <Link href={`?page=${pagination.page - 1}`}>Previous</Link>
            ) : (
              <span>Previous</span>
            )}
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link href={`?page=${pageNum}`}>{pageNum}</Link>
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            disabled={pagination.page === pagination.pages}
            asChild={pagination.page < pagination.pages}
          >
            {pagination.page < pagination.pages ? (
              <Link href={`?page=${pagination.page + 1}`}>Next</Link>
            ) : (
              <span>Next</span>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
