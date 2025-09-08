import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateAddressSchema = z.object({
  type: z.enum(['HOME', 'WORK', 'OTHER']),
  street: z.string().min(1),
  city: z.string().min(1),
  governorate: z.string().min(1),
  postalCode: z.string().optional(),
  isDefault: z.boolean().default(false)
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateAddressSchema.parse(body)

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if address belongs to user
    const existingAddress = await db.address.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      }
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // If this is set as default, unset other defaults
    if (validatedData.isDefault) {
      await db.address.updateMany({
        where: { 
          userId: user.id,
          id: { not: params.id }
        },
        data: { isDefault: false }
      })
    }

    const updatedAddress = await db.address.update({
      where: { id: params.id },
      data: {
        type: validatedData.type,
        street: validatedData.street,
        city: validatedData.city,
        governorate: validatedData.governorate,
        postalCode: validatedData.postalCode,
        isDefault: validatedData.isDefault,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    console.error('Error updating address:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update address' },
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if address belongs to user
    const existingAddress = await db.address.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      }
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    await db.address.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Address deleted successfully' })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    )
  }
}
