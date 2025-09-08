'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react'
import { ProductOptions } from './product-options'
import { PriceDisplay } from './price-display'
import { useCart } from '@/contexts/cart-context'
import { formatPrice } from '@/lib/utils/price'

interface ProductInfoProps {
  product: {
    id: string
    title: string
    description?: string
    basePrice: number
    comparePrice?: number
    category: {
      name: string
      slug: string
    }
    options: Array<{
      id: string
      name: string
      values: Array<{
        id: string
        value: string
        hexColor?: string
      }>
    }>
    variants: Array<{
      id: string
      sku: string
      price: number
      comparePrice?: number
      inventory: number
      isDefault: boolean
      options: Array<{
        id: string
        value: string
        option: {
          name: string
        }
      }>
    }>
  }
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart } = useCart()
  const [selectedVariant, setSelectedVariant] = useState(() => {
    return product.variants.find(v => v.isDefault) || product.variants[0]
  })
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async () => {
    if (!selectedVariant) return

    setIsLoading(true)
    try {
      await addToCart(product.id, selectedVariant.id, quantity)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isOutOfStock = !selectedVariant || selectedVariant.inventory === 0
  const hasDiscount = selectedVariant?.comparePrice && selectedVariant.comparePrice > selectedVariant.price

  return (
    <div className="space-y-6">
      {/* Product Title and Category */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">{product.category.name}</p>
        <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
      </div>

      {/* Price */}
      <PriceDisplay
        price={selectedVariant?.price || product.basePrice}
        comparePrice={selectedVariant?.comparePrice || product.comparePrice}
        size="lg"
      />

      {/* Stock Status */}
      <div>
        {isOutOfStock ? (
          <Badge variant="secondary">Out of Stock</Badge>
        ) : selectedVariant && selectedVariant.inventory <= 5 ? (
          <Badge variant="destructive">Only {selectedVariant.inventory} left!</Badge>
        ) : (
          <Badge variant="default">In Stock</Badge>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>
      )}

      <Separator />

      {/* Product Options */}
      {product.options.length > 0 && (
        <ProductOptions
          options={product.options}
          variants={product.variants}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
        />
      )}

      {/* Quantity Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Quantity</label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
            disabled={!selectedVariant || quantity >= selectedVariant.inventory}
          >
            +
          </Button>
        </div>
      </div>

      {/* Add to Cart */}
      <div className="space-y-3">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            'Adding to Cart...'
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart - {formatPrice((selectedVariant?.price || product.basePrice) * quantity)}
            </>
          )}
        </Button>

        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            <Heart className="h-4 w-4 mr-2" />
            Wishlist
          </Button>
          <Button variant="outline" className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Separator />

      {/* Features */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Truck className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">Cash on Delivery</p>
            <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">Quality Guarantee</p>
            <p className="text-sm text-muted-foreground">All products are quality-checked</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <RotateCcw className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">Easy Returns</p>
            <p className="text-sm text-muted-foreground">7-day return policy</p>
          </div>
        </div>
      </div>

      {/* Product Details */}
      {selectedVariant && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium">Product Details</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="font-medium">SKU:</span> {selectedVariant.sku}</p>
              <p><span className="font-medium">Category:</span> {product.category.name}</p>
              {selectedVariant?.options?.map((option) => (
                <p key={option.id}>
                  <span className="font-medium">{option.option?.name}:</span> {option.value}
                </p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
