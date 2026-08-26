import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ProductStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      title,
      description,
      categoryId,
      basePrice,
      comparePrice,
      weight,
      tags,
      seoTitle,
      seoDescription,
      status,
      options,
      variants,
      images
    } = data

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create product with transaction
    const product = await db.$transaction(async (tx) => {
      // ponytail: tenantId auto-injected by db.ts extension (also applies to tx)
      const newProduct = await tx.product.create({
        data: {
          title,
          slug,
          description,
          status: status as ProductStatus,
          categoryId,
          basePrice,
          comparePrice,
          weight,
          tags,
          seoTitle,
          seoDescription,
        } as any
      })

      // Create product options
      for (const option of options) {
        const productOption = await tx.productOption.create({
          data: {
            productId: newProduct.id,
            name: option.name,
            position: 0,
          }
        })

        // Create option values
        for (const value of option.values) {
          await tx.optionValue.create({
            data: {
              optionId: productOption.id,
              value: value.value,
              hexColor: value.hexColor,
              position: 0,
            }
          })
        }
      }

      // Create variants
      for (const variant of variants) {
        const newVariant = await tx.variant.create({
          data: {
            productId: newProduct.id,
            sku: variant.sku,
            price: variant.price,
            comparePrice: variant.comparePrice,
            inventory: variant.inventory,
            isDefault: variant.isDefault,
          }
        })

        // Connect variant to option values
        for (const [optionName, optionValue] of Object.entries(variant.options)) {
          const optionValueRecord = await tx.optionValue.findFirst({
            where: {
              value: optionValue as string,
              option: {
                productId: newProduct.id,
                name: optionName,
              }
            }
          })

          if (optionValueRecord) {
            await tx.$executeRaw`
              INSERT INTO "_VariantOptions" ("A", "B") 
              VALUES (${newVariant.id}, ${optionValueRecord.id})
            `
          }
        }
      }

      // Create media records
      for (const [index, image] of images.entries()) {
        await tx.media.create({
          data: {
            productId: newProduct.id,
            variantId: image.variantId || null, // Support variant-specific images
            url: image.url,
            altText: image.altText,
            position: index,
          }
        })
      }

      return newProduct
    })

    return NextResponse.json({ 
      success: true, 
      product: { id: product.id, slug: product.slug } 
    })

  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const categoryId = searchParams.get('categoryId') || ''

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (status) {
      where.status = status
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          media: {
            orderBy: { position: 'asc' },
            take: 1,
          },
          variants: {
            orderBy: { isDefault: 'desc' },
            take: 1,
          },
          _count: {
            select: { variants: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
