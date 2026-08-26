import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  maxPrice: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  colors: z.string().optional(),
  materials: z.string().optional(),
  sizes: z.string().optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc']).optional(),
  page: z.string().transform(val => val ? parseInt(val) : 1).optional(),
  limit: z.string().transform(val => val ? parseInt(val) : 12).optional(),
  inStock: z.string().transform(val => val === 'true').optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const {
      q,
      category,
      minPrice,
      maxPrice,
      colors,
      materials,
      sizes,
      sortBy = 'newest',
      page = 1,
      limit = 12,
      inStock
    } = searchParamsSchema.parse(params)

    // Build where clause
    const where: any = {
      status: 'ACTIVE'
    }

    // Text search
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
        { category: { name: { contains: q, mode: 'insensitive' } } }
      ]
    }

    // Category filter
    if (category) {
      where.category = {
        slug: category
      }
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {}
      if (minPrice !== undefined) {
        where.basePrice.gte = minPrice
      }
      if (maxPrice !== undefined) {
        where.basePrice.lte = maxPrice
      }
    }

    // Variant-based filters
    const variantFilters: any = {}
    
    if (colors) {
      const colorArray = colors.split(',').map(c => c.trim())
      variantFilters.options = {
        some: {
          AND: [
            { option: { name: 'Color' } },
            { value: { in: colorArray } }
          ]
        }
      }
    }

    if (materials) {
      const materialArray = materials.split(',').map(m => m.trim())
      if (!variantFilters.options) {
        variantFilters.options = { some: {} }
      }
      variantFilters.options.some.AND = [
        ...(variantFilters.options.some.AND || []),
        { option: { name: 'Material' } },
        { value: { in: materialArray } }
      ]
    }

    if (sizes) {
      const sizeArray = sizes.split(',').map(s => s.trim())
      if (!variantFilters.options) {
        variantFilters.options = { some: {} }
      }
      variantFilters.options.some.AND = [
        ...(variantFilters.options.some.AND || []),
        { option: { name: 'Size' } },
        { value: { in: sizeArray } }
      ]
    }

    // Stock filter
    if (inStock) {
      variantFilters.inventory = { gt: 0 }
    }

    // Add variant filters to main where clause
    if (Object.keys(variantFilters).length > 0) {
      where.variants = { some: variantFilters }
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' } // default newest

    switch (sortBy) {
      case 'price_asc':
        orderBy = { basePrice: 'asc' }
        break
      case 'price_desc':
        orderBy = { basePrice: 'desc' }
        break
      case 'name_asc':
        orderBy = { title: 'asc' }
        break
      case 'name_desc':
        orderBy = { title: 'desc' }
        break
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute search query
    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: {
            select: { name: true, slug: true }
          },
          media: {
            where: { variantId: null },
            orderBy: { position: 'asc' },
            take: 1
          },
          variants: {
            include: {
              options: {
                include: {
                  option: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.product.count({ where })
    ])

    // Get filter options for faceted search
    const [categories, availableColors, availableMaterials, availableSizes] = await Promise.all([
      db.category.findMany({
        where: { isActive: true },
        select: { name: true, slug: true, _count: { select: { products: true } } },
        orderBy: { name: 'asc' }
      }),
      db.optionValue.findMany({
        where: {
          option: { name: 'Color' },
          variants: {
            some: { product: { status: 'PUBLISHED' } }
          }
        },
        select: { value: true },
        distinct: ['value'],
        orderBy: { value: 'asc' }
      }),
      db.optionValue.findMany({
        where: {
          option: { name: 'Material' },
          variants: {
            some: { product: { status: 'PUBLISHED' } }
          }
        },
        select: { value: true },
        distinct: ['value'],
        orderBy: { value: 'asc' }
      }),
      db.optionValue.findMany({
        where: {
          option: { name: 'Size' },
          variants: {
            some: { product: { status: 'PUBLISHED' } }
          }
        },
        select: { value: true },
        distinct: ['value'],
        orderBy: { value: 'asc' }
      })
    ])

    // Transform products for response
    const transformedProducts = products.map((product: any) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      basePrice: Number(product.basePrice),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      category: product.category,
      image: product.media[0]?.url || '/placeholder-product.jpg',
      inStock: product.variants.some((v: any) => v.inventory > 0),
      variants: product.variants.length,
      colors: product.variants
        .flatMap((v: any) => v.options.filter((o: any) => o.option.name === 'Color').map((o: any) => o.value))
        .filter((value: any, index: any, self: any) => self.indexOf(value) === index)
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        categories: categories.map((cat: any) => ({
          name: cat.name,
          slug: cat.slug,
          count: cat._count.products
        })),
        colors: availableColors.map((c: any) => c.value),
        materials: availableMaterials.map((m: any) => m.value),
        sizes: availableSizes.map((s: any) => s.value)
      },
      appliedFilters: {
        q,
        category,
        minPrice,
        maxPrice,
        colors: colors?.split(',').map(c => c.trim()),
        materials: materials?.split(',').map(m => m.trim()),
        sizes: sizes?.split(',').map(s => s.trim()),
        sortBy,
        inStock
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}
