import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // First get the current product to find its category and tags
    // ponytail: findFirst — slug is composite unique
    const currentProduct = await prisma.product.findFirst({
      where: { slug: params.slug },
      select: {
        id: true,
        categoryId: true,
        tags: true,
      }
    })

    if (!currentProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    // Find related products based on category and tags
    const relatedProducts = await prisma.product.findMany({
      where: {
        AND: [
          { id: { not: currentProduct.id } }, // Exclude current product
          {
            OR: [
              // Same category
              { categoryId: currentProduct.categoryId },
              // Shared tags
              ...(currentProduct.tags && currentProduct.tags.length > 0 
                ? [{ tags: { hasSome: currentProduct.tags } }]
                : []
              )
            ]
          }
        ]
      },
      include: {
        category: true,
        media: {
          orderBy: { position: 'asc' },
          take: 1,
        },
        variants: {
          where: { inventory: { gt: 0 } },
          orderBy: { isDefault: 'desc' },
          take: 1,
        },
      },
      orderBy: [
        // Prioritize products from same category
        { categoryId: currentProduct.categoryId ? 'asc' : 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
    })

    // Calculate relevance score for better sorting
    const scoredProducts = relatedProducts.map(product => {
      let score = 0
      
      // Same category gets higher score
      if (product.categoryId === currentProduct.categoryId) {
        score += 10
      }
      
      // Shared tags get points
      if (currentProduct.tags && product.tags) {
        const sharedTags = currentProduct.tags.filter(tag => 
          product.tags?.includes(tag)
        )
        score += sharedTags.length * 5
      }
      
      return { ...product, relevanceScore: score }
    })

    // Sort by relevance score
    const sortedProducts = scoredProducts.sort((a, b) => b.relevanceScore - a.relevanceScore)

    return NextResponse.json({
      products: sortedProducts,
      total: sortedProducts.length,
      currentProduct: {
        id: currentProduct.id,
        categoryId: currentProduct.categoryId,
        tags: currentProduct.tags
      }
    })
  } catch (error) {
    console.error('Error fetching related products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch related products' },
      { status: 500 }
    )
  }
}
