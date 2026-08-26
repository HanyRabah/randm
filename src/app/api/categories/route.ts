import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: { products: true }
        }
      }
    })

    return NextResponse.json(categories)
  } catch (error: any) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', detail: `${error?.code ?? ''} ${error?.message ?? String(error)}`.slice(0, 500) },
      { status: 500 }
    )
  }
}
