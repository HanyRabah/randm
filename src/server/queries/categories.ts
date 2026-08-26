import { db } from '@/lib/db'

export async function getCategories() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return categories
}

export async function getCategoryBySlug(slug: string): Promise<any> {
  // ponytail: findFirst — slug is now composite unique (tenantId,slug); extension scopes tenantId
  const category = await db.category.findFirst({
    where: { slug, isActive: true },
    include: {
      parent: true,
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: { products: true },
      },
    },
  })

  return category
}

export async function getCategoryHierarchy(slug: string) {
  const category = await getCategoryBySlug(slug)
  if (!category) return []

  const breadcrumbs = []
  let current = category

  // Build breadcrumb trail
  while (current) {
    breadcrumbs.unshift({
      name: current.name,
      slug: current.slug,
      href: `/category/${current.slug}`,
    })

    if (current.parentId) {
      const parent = await db.category.findUnique({
        where: { id: current.parentId },
      })
      if (parent) {
        current = parent as any
      } else {
        break
      }
    } else {
      break
    }
  }

  return breadcrumbs
}
