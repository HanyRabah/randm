'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWishlist } from '@/contexts/wishlist-context'
import { useCart } from '@/contexts/cart-context'
import { ProductCard } from '@/components/product/product-card'
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Grid3X3, 
  List,
  Package,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils/price'

export default function WishlistPage() {
  const { items, itemCount, loading, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set())

  const handleRemoveFromWishlist = async (productId: string) => {
    setRemovingItems(prev => new Set(prev).add(productId))
    try {
      await removeFromWishlist(productId)
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(prev => new Set(prev).add(productId))
    try {
      await addToCart(productId, '1')
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleMoveToCart = async (productId: string) => {
    await handleAddToCart(productId)
    await handleRemoveFromWishlist(productId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="ml-2 text-gray-600">Loading your wishlist...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 mr-3 text-amber-400" />
              <h1 className="text-4xl lg:text-5xl font-bold">
                My Wishlist
              </h1>
            </div>
            <p className="text-xl text-gray-300">
              {itemCount > 0 
                ? `${itemCount} item${itemCount !== 1 ? 's' : ''} saved for later`
                : 'Save your favorite products for later'
              }
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-8">
        {items.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <Heart className="h-24 w-24 mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Your wishlist is empty
                </h2>
                <p className="text-gray-600 mb-6">
                  Start adding products you love to keep track of them and purchase later.
                </p>
              </div>
              <div className="space-y-4">
                <Button asChild className="bg-amber-600 hover:bg-amber-700">
                  <Link href="/search">
                    <Package className="h-4 w-4 mr-2" />
                    Browse Products
                  </Link>
                </Button>
                <div className="text-sm text-gray-500">
                  <p>💡 Tip: Click the heart icon on any product to add it to your wishlist</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Wishlist Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Saved Items ({itemCount})
                </h2>
                <p className="text-gray-600">
                  Products you've saved for later consideration
                </p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                {/* View Mode Toggle */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Wishlist Items */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {items.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    {viewMode === 'grid' ? (
                      // Grid View
                      <div>
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden rounded-t-lg">
                          <Link href={`/product/${item.product.slug}`}>
                            <img
                              src={item.product.image}
                              alt={item.product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                          
                          {/* Quick Actions */}
                          <div className="absolute top-2 right-2">
                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() => handleRemoveFromWishlist(item.product.id)}
                              disabled={removingItems.has(item.product.id)}
                              className="bg-white/90 hover:bg-white shadow-md"
                            >
                              {removingItems.has(item.product.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          </div>

                          {!item.product.inStock && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Badge variant="secondary" className="bg-red-500 text-white">
                                Out of Stock
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <Badge variant="outline" className="mb-2 text-xs">
                            {item.product.category.name}
                          </Badge>
                          
                          <Link href={`/product/${item.product.slug}`}>
                            <h3 className="font-semibold mb-2 hover:text-amber-600 transition-colors line-clamp-2">
                              {item.product.title}
                            </h3>
                          </Link>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-amber-600">
                                {formatPrice(item.product.basePrice)}
                              </span>
                              {item.product.comparePrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(item.product.comparePrice)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="space-y-2">
                            <Button
                              className="w-full bg-amber-600 hover:bg-amber-700"
                              onClick={() => handleMoveToCart(item.product.id)}
                              disabled={!item.product.inStock || addingToCart.has(item.product.id)}
                            >
                              {addingToCart.has(item.product.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <ShoppingCart className="h-4 w-4 mr-2" />
                              )}
                              Move to Cart
                            </Button>
                          </div>

                          <div className="text-xs text-gray-500 mt-2">
                            Added {new Date(item.addedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // List View
                      <div className="flex p-4">
                        {/* Product Image */}
                        <div className="relative w-32 h-32 flex-shrink-0 mr-4">
                          <Link href={`/product/${item.product.slug}`}>
                            <img
                              src={item.product.image}
                              alt={item.product.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </Link>
                          {!item.product.inStock && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                              <Badge variant="secondary" className="bg-red-500 text-white text-xs">
                                Out of Stock
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <Badge variant="outline" className="mb-2 text-xs">
                                {item.product.category.name}
                              </Badge>
                              <Link href={`/product/${item.product.slug}`}>
                                <h3 className="font-semibold text-lg hover:text-amber-600 transition-colors">
                                  {item.product.title}
                                </h3>
                              </Link>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFromWishlist(item.product.id)}
                              disabled={removingItems.has(item.product.id)}
                            >
                              {removingItems.has(item.product.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          </div>

                          <div className="flex items-center space-x-2 mb-4">
                            <span className="text-xl font-bold text-amber-600">
                              {formatPrice(item.product.basePrice)}
                            </span>
                            {item.product.comparePrice && (
                              <span className="text-lg text-gray-500 line-through">
                                {formatPrice(item.product.comparePrice)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              Added {new Date(item.addedAt).toLocaleDateString()}
                            </div>
                            <Button
                              onClick={() => handleMoveToCart(item.product.id)}
                              disabled={!item.product.inStock || addingToCart.has(item.product.id)}
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              {addingToCart.has(item.product.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <ShoppingCart className="h-4 w-4 mr-2" />
                              )}
                              Move to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/search">
                  <Package className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
