import { db } from '@/lib/db'
import { OrderStatus } from '@prisma/client'

export async function getOrderByNumber(orderNumber: string) {
  try {
    const order = await db.order.findUnique({
      where: { orderNumber },
      include: {
        customer: true,
        address: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                media: {
                  take: 1,
                  orderBy: { position: 'asc' },
                },
              },
            },
            variant: {
              include: {
                options: {
                  include: {
                    option: true,
                  },
                },
              },
            },
          },
        },
        coupon: true,
      },
    })

    return order
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export async function getOrdersByCustomer(customerId: string, limit = 10) {
  try {
    const orders = await db.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                media: {
                  take: 1,
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return orders
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    return []
  }
}

export async function getOrdersForAdmin({
  status,
  search,
  page = 1,
  limit = 20,
}: {
  status?: OrderStatus
  search?: string
  page?: number
  limit?: number
} = {}) {
  try {
    const skip = (page - 1) * limit

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' as const } },
          { customer: { email: { contains: search, mode: 'insensitive' as const } } },
          { customer: { firstName: { contains: search, mode: 'insensitive' as const } } },
          { customer: { lastName: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: {
              product: {
                select: { title: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return {
      orders: [],
      pagination: { page: 1, limit, total: 0, pages: 0 },
    }
  }
}

export async function getOrderStats() {
  try {
    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalRevenue,
      todayOrders,
    ] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: 'PENDING' } }),
      db.order.count({ where: { status: 'DELIVERED' } }),
      db.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELED' } },
      }),
      db.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ])

    return {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      todayOrders,
    }
  } catch (error) {
    console.error('Error fetching order stats:', error)
    return {
      totalOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      totalRevenue: 0,
      todayOrders: 0,
    }
  }
}

export async function getRecentOrders(limit = 5) {
  try {
    const orders = await db.order.findMany({
      include: {
        customer: true,
        items: {
          take: 1,
          include: {
            product: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return orders
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return []
  }
}
