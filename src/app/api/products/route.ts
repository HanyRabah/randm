import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cachedResponse, memoryCache, cacheKeys } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')
    const page = Math.floor(offset / limit) + 1

    // Check memory cache first
    const cacheKey = cacheKeys.products(page, limit, category || undefined)
    const cached = memoryCache.get(cacheKey)
    if (cached) {
      return cachedResponse(cached, 'products')
    }

    const where = category ? { category: { slug: category } } : {}

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        media: {
          orderBy: { position: 'asc' }
        },
        options: {
          include: {
            values: true
          }
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
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.product.count({ where })

    const result = {
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    }

    // Cache the result
    memoryCache.set(cacheKey, result, 60) // Cache for 1 minute

    return cachedResponse(result, 'products')
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
