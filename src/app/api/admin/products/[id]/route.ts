import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateProductSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  categoryId: z.string().min(1),
  basePrice: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  options: z.array(z.object({
    id: z.string(),
    name: z.string(),
    values: z.array(z.object({
      id: z.string(),
      value: z.string(),
      hexColor: z.string().optional()
    }))
  })).optional(),
  variants: z.array(z.object({
    id: z.string(),
    sku: z.string(),
    price: z.number(),
    comparePrice: z.number().optional(),
    inventory: z.number(),
    isDefault: z.boolean(),
    options: z.record(z.string())
  })).optional(),
  images: z.array(z.object({
    id: z.string(),
    url: z.string(),
    altText: z.string()
  })).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product = await db.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: {
          select: {
            id: true,
            sku: true,
            price: true,
            comparePrice: true,
            inventory: true,
            isDefault: true,
          },
        },
        media: {
          select: {
            id: true,
            url: true,
            altText: true,
            position: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if slug is unique (excluding current product)
    if (validatedData.slug !== existingProduct.slug) {
      const existingSlug = await db.product.findFirst({
        where: {
          slug: validatedData.slug,
          id: { not: params.id },
        },
      })

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update product with transaction
    const updatedProduct = await db.$transaction(async (tx) => {
      // Update basic product info
      const product = await tx.product.update({
        where: { id: params.id },
        data: {
          title: validatedData.title,
          slug: validatedData.slug,
          description: validatedData.description,
          status: validatedData.status,
          categoryId: validatedData.categoryId,
          basePrice: validatedData.basePrice,
          comparePrice: validatedData.comparePrice,
          weight: validatedData.weight,
          tags: validatedData.tags || [],
          seoTitle: validatedData.seoTitle,
          seoDescription: validatedData.seoDescription,
          updatedAt: new Date(),
        },
      })

      // Update options if provided
      if (validatedData.options) {
        // Delete existing options and values
        await tx.optionValue.deleteMany({
          where: {
            option: {
              productId: params.id
            }
          }
        })
        await tx.productOption.deleteMany({
          where: { productId: params.id }
        })

        // Create new options
        for (const option of validatedData.options) {
          const productOption = await tx.productOption.create({
            data: {
              productId: params.id,
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
      }

      // Update variants if provided
      if (validatedData.variants) {
        // Delete existing variants
        await tx.variant.deleteMany({
          where: { productId: params.id }
        })

        // Create new variants
        for (const variant of validatedData.variants) {
          const newVariant = await tx.variant.create({
            data: {
              productId: params.id,
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
                value: optionValue,
                option: {
                  productId: params.id,
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
      }

      // Update images if provided
      if (validatedData.images) {
        // Delete existing media
        await tx.media.deleteMany({
          where: { productId: params.id }
        })

        // Create new media records
        for (let i = 0; i < validatedData.images.length; i++) {
          const image = validatedData.images[i]
          await tx.media.create({
            data: {
              productId: params.id,
              url: image.url,
              altText: image.altText,
              position: i,
            }
          })
        }
      }

      return product
    })

    // Fetch updated product with all relations
    const productWithRelations = await db.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: {
          select: {
            id: true,
            sku: true,
            price: true,
            comparePrice: true,
            inventory: true,
            isDefault: true,
          },
        },
        media: {
          select: {
            id: true,
            url: true,
            altText: true,
            position: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    })

    return NextResponse.json(productWithRelations)
  } catch (error) {
    console.error('Error updating product:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete product (cascade will handle related records)
    await db.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
