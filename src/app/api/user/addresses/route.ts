import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  buildingNumber: z.string().optional(),
  floorNumber: z.string().optional(),
  apartmentNumber: z.string().optional(),
  country: z.string().min(1),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false)
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        addresses: {
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'desc' }
          ]
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user.addresses)
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAddressSchema.parse(body)

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If this is set as default, unset other defaults
    if (validatedData.isDefault) {
      await db.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      })
    }

    const address = await db.address.create({
      data: {
        userId: user.id,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        company: validatedData.company,
        line1: validatedData.line1,
        line2: validatedData.line2,
        city: validatedData.city,
        state: validatedData.state,
        buildingNumber: validatedData.buildingNumber,
        floorNumber: validatedData.floorNumber,
        apartmentNumber: validatedData.apartmentNumber,
        country: validatedData.country,
        phone: validatedData.phone,
        isDefault: validatedData.isDefault
      }
    })

    return NextResponse.json(address)
  } catch (error) {
    console.error('Error creating address:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    )
  }
}
