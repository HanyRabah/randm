'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Minus } from 'lucide-react'
import { updateCartItem, removeFromCart } from '@/server/actions/cart'
import { useToast } from '@/components/ui/use-toast'
import { formatPrice } from '@/lib/utils/price'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    title: string
    slug: string
    media: Array<{
      url: string
      altText?: string | null
    }>
  }
  variant?: {
    id: string
    price: number | any
    sku: string
    inventory: number
    options: Array<{
      id: string
      value: string
      option: {
        name: string
      }
    }>
  } | null
}

interface CartItemsProps {
  items: CartItem[]
}

export function CartItems({ items }: CartItemsProps) {
  const { toast } = useToast()
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set())

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    setLoadingItems(prev => new Set(prev).add(itemId))

    const formData = new FormData()
    formData.append('quantity', newQuantity.toString())

    try {
      const result = await updateCartItem(itemId, formData)
      
      if (!result.success) {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update item',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive',
      })
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setLoadingItems(prev => new Set(prev).add(itemId))

    try {
      const result = await removeFromCart(itemId)
      
      if (result.success) {
        toast({
          title: 'Item removed',
          description: 'Item has been removed from your cart',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to remove item',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      })
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isLoading = loadingItems.has(item.id)
        const price = item.variant?.price || 0
        const maxQuantity = item.variant?.inventory || 99

        return (
          <Card key={item.id} className={isLoading ? 'opacity-50' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <Link href={`/product/${item.product.slug}`}>
                    <div className="w-20 h-20 relative rounded-md overflow-hidden">
                      {item.product.media[0] ? (
                        <Image
                          src={item.product.media[0].url}
                          alt={item.product.media[0].altText || item.product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No image</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product.slug}`}>
                    <h3 className="font-medium text-lg hover:text-primary transition-colors">
                      {item.product.title}
                    </h3>
                  </Link>
                  
                  {/* Variant Options */}
                  {item.variant?.options && item.variant.options.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {item.variant.options.map((option) => (
                        <p key={option.id} className="text-sm text-muted-foreground">
                          {option.option.name}: {option.value}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* SKU */}
                  {item.variant?.sku && (
                    <p className="text-sm text-muted-foreground mt-1">
                      SKU: {item.variant.sku}
                    </p>
                  )}

                  {/* Price */}
                  <p className="font-bold text-lg mt-2">
                    {formatPrice(price)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                    disabled={item.quantity <= 1 || isLoading}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={item.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1
                      if (newQuantity !== item.quantity && newQuantity >= 1 && newQuantity <= maxQuantity) {
                        handleQuantityChange(item.id, newQuantity)
                      }
                    }}
                    className="w-16 text-center"
                    disabled={isLoading}
                  />
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(item.id, Math.min(maxQuantity, item.quantity + 1))}
                    disabled={item.quantity >= maxQuantity || isLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={isLoading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Item Total */}
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {item.quantity} × {formatPrice(price)}
                </span>
                <span className="font-bold">
                  {formatPrice(price * item.quantity)}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
