'use client'

import { useState, useEffect } from 'react'
import { ProductGallery } from './product-gallery'

interface VariantGalleryProps {
  product: any
  selectedVariant: any
}

export function VariantGallery({ product, selectedVariant }: VariantGalleryProps) {
  // Filter product-level images (not associated with any variant)
  const productImages = product.media?.filter((img: any) => !img.variantId) || []
  
  // Get variant-specific images
  const variantImages = selectedVariant?.media || []
  
  // Use variant images if available, otherwise fall back to product images
  const displayImages = variantImages.length > 0 ? variantImages : productImages

  return (
    <ProductGallery 
      images={displayImages}
      selectedVariant={selectedVariant}
      productImages={productImages}
    />
  )
}
