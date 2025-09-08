'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProductImage {
  url: string
  altText?: string
  variantId?: string | null
}

interface ProductGalleryProps {
  images: ProductImage[]
  selectedVariant?: any
  productImages?: ProductImage[]
}

export function ProductGallery({ images, selectedVariant, productImages = [] }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  
  // Get images to display based on selected variant
  const displayImages = selectedVariant?.media?.length > 0 
    ? selectedVariant.media 
    : productImages.length > 0 
      ? productImages 
      : images

  // Reset selected image when variant changes
  useEffect(() => {
    setSelectedImage(0)
  }, [selectedVariant?.id])

  if (displayImages.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">No images available</span>
      </div>
    )
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % displayImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src={displayImages[selectedImage].url}
          alt={displayImages[selectedImage].altText || 'Product image'}
          fill
          className="object-cover"
          priority
        />
        
        {displayImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Images */}
      {displayImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={cn(
                'flex-shrink-0 aspect-square w-20 h-20 rounded-md overflow-hidden border-2 transition-colors',
                selectedImage === index
                  ? 'border-primary'
                  : 'border-transparent hover:border-muted-foreground'
              )}
            >
              <Image
                src={image.url}
                alt={image.altText || `Product image ${index + 1}`}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
