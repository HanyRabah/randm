import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(
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

    // Unset all other defaults for this user
    await db.address.updateMany({
      where: { 
        userId: user.id,
        id: { not: params.id }
      },
      data: { isDefault: false }
    })

    // Set this address as default
    const updatedAddress = await db.address.update({
      where: { id: params.id },
      data: {
        isDefault: true
      }
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    console.error('Error setting default address:', error)
    return NextResponse.json(
      { error: 'Failed to set default address' },
      { status: 500 }
    )
  }
}
