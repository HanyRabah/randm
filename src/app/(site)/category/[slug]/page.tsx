import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getCategoryBySlug, getCategoryHierarchy } from '@/server/queries/categories'
import { getProducts, getProductFilters } from '@/server/queries/products'
import { ProductGrid } from '@/components/product/product-grid'
import { ProductFilters } from '@/components/product/product-filters'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

interface CategoryPageProps {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug)
  
  if (!category) {
    return await generateSEOMetadata()
  }

  return await generateSEOMetadata({
    title: `${category.name} - Premium Furniture Collection`,
    description: category.description || `Discover our ${category.name} collection. Premium furniture with Cash on Delivery, fast shipping, and quality guarantee.`,
    url: `/category/${category.slug}`,
  })
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug)
  
  if (!category) {
    notFound()
  }

  const breadcrumbs = await getCategoryHierarchy(params.slug)
  
  // Parse search params
  const filters = {
    categorySlug: params.slug,
    search: searchParams.q as string,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice as string) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice as string) : undefined,
    colors: searchParams.colors ? (Array.isArray(searchParams.colors) ? searchParams.colors : [searchParams.colors]) : undefined,
    sizes: searchParams.sizes ? (Array.isArray(searchParams.sizes) ? searchParams.sizes : [searchParams.sizes]) : undefined,
    page: searchParams.page ? parseInt(searchParams.page as string) : 1,
    sort: searchParams.sort as any || 'newest',
  }

  const [productsData, availableFilters] = await Promise.all([
    getProducts(filters),
    getProductFilters(params.slug),
  ])

  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { name: 'Home', href: '/' },
          ...breadcrumbs,
        ]} 
      />

      {/* Category Header */}
      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-lg text-muted-foreground">{category.description}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {productsData.pagination.total} products
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Suspense fallback={<div>Loading filters...</div>}>
            <ProductFilters 
              availableFilters={availableFilters}
              currentFilters={filters}
            />
          </Suspense>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <Suspense fallback={<div>Loading products...</div>}>
            <ProductGrid 
              products={productsData.products as any}
              pagination={productsData.pagination}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
