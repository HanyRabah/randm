import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { GET } from '@/app/api/categories/route'
import { prisma } from '@/lib/db'

describe('/api/categories', () => {
  beforeAll(async () => {
    // Ensure we have test data
    const categoryCount = await prisma.category.count()
    if (categoryCount === 0) {
      throw new Error('No categories found in database. Run seed script first.')
    }
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const request = new Request('http://localhost:3000/api/categories')
      const response = await GET(request)
      const categories = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(categories)).toBe(true)
      expect(categories.length).toBeGreaterThan(0)
    })

    it('should return categories with correct structure', async () => {
      const request = new Request('http://localhost:3000/api/categories')
      const response = await GET(request)
      const categories = await response.json()

      const category = categories[0]
      expect(category).toHaveProperty('id')
      expect(category).toHaveProperty('name')
      expect(category).toHaveProperty('slug')
      expect(category).toHaveProperty('description')
      expect(category).toHaveProperty('_count')
      expect(category._count).toHaveProperty('products')
    })

    it('should include product counts', async () => {
      const request = new Request('http://localhost:3000/api/categories')
      const response = await GET(request)
      const categories = await response.json()

      categories.forEach((category: any) => {
        expect(typeof category._count.products).toBe('number')
        expect(category._count.products).toBeGreaterThanOrEqual(0)
      })
    })

    it('should return categories with expected names', async () => {
      const request = new Request('http://localhost:3000/api/categories')
      const response = await GET(request)
      const categories = await response.json()

      const categoryNames = categories.map((cat: any) => cat.name)
      expect(categoryNames).toContain('Coffee Tables')
      expect(categoryNames).toContain('Desks')
      expect(categoryNames).toContain('Chairs')
    })
  })
})
