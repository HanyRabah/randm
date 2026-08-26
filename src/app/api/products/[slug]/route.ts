import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // ponytail: findFirst — slug is composite unique (tenantId,slug); extension scopes tenantId
    const product = await prisma.product.findFirst({
      where: { slug: params.slug },
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
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
