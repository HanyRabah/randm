import { db } from '@/lib/db'
// Remove ProductStatus import as it doesn't exist in schema

export interface ProductFilters {
  categorySlug?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  sizes?: string[]
  page?: number
  limit?: number
  sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'
}

export async function getProducts(filters: ProductFilters = {}) {
  const {
    categorySlug,
    search,
    minPrice,
    maxPrice,
    colors,
    sizes,
    page = 1,
    limit = 12,
    sort = 'newest',
  } = filters

  const skip = (page - 1) * limit

  // Build where clause
  const where: any = {}

  if (categorySlug) {
    where.category = {
      OR: [
        { slug: categorySlug },
        { parent: { slug: categorySlug } },
      ],
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search] } },
    ]
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) where.price.gte = minPrice
    if (maxPrice !== undefined) where.price.lte = maxPrice
  }

  // Filter by variant options (colors/sizes)
  if (colors?.length || sizes?.length) {
    where.variants = {
      some: {
        options: {
          some: {
            OR: [
              ...(colors?.length ? [{ value: { in: colors } }] : []),
              ...(sizes?.length ? [{ value: { in: sizes } }] : []),
            ],
          },
        },
      },
    }
  }

  // Build order by clause
  let orderBy: any = {}
  switch (sort) {
    case 'newest':
      orderBy = { createdAt: 'desc' }
      break
    case 'oldest':
      orderBy = { createdAt: 'asc' }
      break
    case 'price-asc':
      orderBy = { price: 'asc' }
      break
    case 'price-desc':
      orderBy = { price: 'desc' }
      break
    case 'name-asc':
      orderBy = { name: 'asc' }
      break
    case 'name-desc':
      orderBy = { name: 'desc' }
      break
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: true,
        media: {
          where: { variantId: null }, // Only product-level images for listing
          orderBy: { position: 'asc' },
          take: 1,
        },
        variants: {
          where: { inventory: { gt: 0 } },
          orderBy: { isDefault: 'desc' },
          take: 1,
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ])

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function getProductBySlug(slug: string): Promise<any> {
  // ponytail: findFirst — slug is now composite unique (tenantId,slug); extension scopes tenantId
  const product = await db.product.findFirst({
    where: { slug },
    include: {
      category: {
        include: {
          parent: true,
        },
      },
      media: {
        orderBy: { position: 'asc' },
      },
      options: {
        include: {
          values: {
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      },
      variants: {
        include: {
          options: {
            include: {
              option: true,
            },
          },
          media: {
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { isDefault: 'desc' },
      },
    },
  })

  return product
}

export async function getFeaturedProducts(limit = 8) {
  const products = await db.product.findMany({
    where: {},
    include: {
      category: true,
      media: {
        where: { variantId: null }, // Only product-level images for listing
        orderBy: { position: 'asc' },
        take: 1,
      },
      variants: {
        where: { inventory: { gt: 0 } },
        orderBy: { isDefault: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return products
}

export async function getProductFilters(categorySlug?: string) {
  const where: any = {}

  if (categorySlug) {
    where.category = {
      OR: [
        { slug: categorySlug },
        { parent: { slug: categorySlug } },
      ],
    }
  }

  // Get available colors and sizes
  const products = await db.product.findMany({
    where,
    include: {
      variants: {
        include: {
          options: {
            include: {
              option: true,
            },
          },
        },
      },
    },
  })

  const colors = new Set<string>()
  const sizes = new Set<string>()

  products.forEach((product) => {
    product.variants.forEach((variant) => {
      variant.options.forEach((optionValue) => {
        if (optionValue.option.name.toLowerCase() === 'color') {
          colors.add(optionValue.value)
        } else if (optionValue.option.name.toLowerCase() === 'size') {
          sizes.add(optionValue.value)
        }
      })
    })
  })

  return {
    colors: Array.from(colors),
    sizes: Array.from(sizes),
  }
}
