'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PriceDisplay } from './price-display'
import { Skeleton } from '@/components/ui/skeleton'

interface RelatedProduct {
  id: string
  title: string
  slug: string
  basePrice: string
  comparePrice?: string
  category: {
    name: string
    slug: string
  }
  media: Array<{
    url: string
    altText: string
  }>
  variants: Array<{
    price: string
    comparePrice?: string
    inventory: number
  }>
  relevanceScore: number
}

interface RelatedProductsProps {
  productSlug: string
  limit?: number
}

export function RelatedProducts({ productSlug, limit = 8 }: RelatedProductsProps) {
  const [products, setProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${productSlug}/related?limit=${limit}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch related products')
        }
        
        const data = await response.json()
        setProducts(data.products || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (productSlug) {
      fetchRelatedProducts()
    }
  }, [productSlug, limit])

  if (loading) {
    return (
      <section className="py-12">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square relative">
                  <Skeleton className="w-full h-full" />
                </div>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-3" />
                  <Skeleton className="h-6 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error || products.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">You might also like</h2>
          <p className="text-muted-foreground">
            Similar products based on category and features
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const mainImage = product.media[0]
            const variant = product.variants[0]
            const price = variant?.price || product.basePrice
            const comparePrice = variant?.comparePrice || product.comparePrice
            
            return (
              <Link key={product.id} href={`/product/${product.slug}`}>
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {mainImage ? (
                      <Image
                        src={mainImage.url}
                        alt={mainImage.altText}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                    
                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="text-xs">
                        {product.category.name}
                      </Badge>
                    </div>
                    
                    {/* Discount badge */}
                    {comparePrice && parseFloat(comparePrice) > parseFloat(price) && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="destructive" className="text-xs">
                          {Math.round(((parseFloat(comparePrice) - parseFloat(price)) / parseFloat(comparePrice)) * 100)}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <PriceDisplay
                        price={price}
                        comparePrice={comparePrice}
                        size="sm"
                      />
                      
                      {variant && variant.inventory <= 5 && variant.inventory > 0 && (
                        <Badge variant="outline" className="text-xs text-orange-600">
                          Only {variant.inventory} left
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
        
        {products.length >= limit && (
          <div className="text-center mt-8">
            <Link 
              href={`/category/${products[0]?.category.slug}`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              View more in {products[0]?.category.name}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
