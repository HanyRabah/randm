import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/server/queries/products'
import { getCategoryHierarchy } from '@/server/queries/categories'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductInfo } from '@/components/product/product-info'
import { VariantSelector } from '@/components/product/variant-selector'
import { RelatedProducts } from '@/components/product/related-products'
import { VariantGallery } from '@/components/product/variant-gallery'
import { ReviewsSection } from '@/components/reviews/reviews-section'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { StructuredData } from '@/components/seo/structured-data'
import { generateMetadata as generateSEOMetadata, generateProductJsonLd } from '@/lib/seo'

interface ProductPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)
  
  if (!product) {
    return await generateSEOMetadata()
  }

  const defaultVariant = product.variants.find((v: any) => v.isDefault) || product.variants[0]
  const price = defaultVariant?.price || product.price
  
  // Use custom SEO fields if available, otherwise generate from product data
  const seoTitle = product.seoTitle || `${product.name} - Premium Furniture`
  const seoDescription = product.seoDescription || 
    product.description || 
    `Shop ${product.name} - Premium furniture with Cash on Delivery, fast shipping, and quality guarantee.`

  return await generateSEOMetadata({
    title: seoTitle,
    description: seoDescription,
    url: `/product/${product.slug}`,
    image: product.media.length > 0 ? product.media[0].url : undefined,
  })
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)
  
  if (!product) {
    notFound()
  }

  const breadcrumbs = product.category ? await getCategoryHierarchy(product.category.slug) : []
  const defaultVariant = product.variants.find((v: any) => v.isDefault) || product.variants[0]

  // Generate JSON-LD for SEO
  const jsonLd = generateProductJsonLd({
    name: product.name,
    description: product.seoDescription || product.description || undefined,
    image: product.media.map((m: any) => m.url),
    price: Number(defaultVariant?.price) || Number(product.price),
    availability: defaultVariant && defaultVariant.inventory > 0 ? 'InStock' : 'OutOfStock',
    sku: defaultVariant?.sku,
    category: product.category?.name,
    url: `${process.env.NEXTAUTH_URL}/product/${product.slug}`,
    brand: 'Furniture Store',
  })

  const productStructuredData = {
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.media.map((m: any) => m.url),
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "category": product.category?.name,
    "sku": defaultVariant?.sku || product.slug,
    "slug": product.slug,
  }

  const breadcrumbData = {
    items: [
      { name: 'Home', href: '/' },
      ...(product.category ? [{ name: product.category.name, href: `/category/${product.category.slug}` }] : []),
      { name: product.name, href: `/product/${product.slug}` }
    ]
  }

  return (
    <>
      <StructuredData type="product" data={productStructuredData} />
      <StructuredData type="breadcrumb" data={breadcrumbData} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { name: 'Home', href: '/' },
            ...(product.category ? [{ name: product.category.name, href: `/category/${product.category.slug}` }] : []),
            { name: product.name, href: `/product/${product.slug}` },
          ]} 
        />

        {/* Product Details */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Gallery */}
          <div className="lg:col-span-1">
            <Suspense fallback={<div>Loading gallery...</div>}>
              <ProductGallery images={product.media as any} />
            </Suspense>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-1">
            <ProductInfo product={product as any} />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <Suspense fallback={<div>Loading reviews...</div>}>
            <ReviewsSection productSlug={product.slug} />
          </Suspense>
        </div>

        {/* Related Products */}
        <Suspense fallback={<div>Loading related products...</div>}>
          <RelatedProducts productSlug={product.slug} limit={8} />
        </Suspense>
      </div>
    </>
  )
}
