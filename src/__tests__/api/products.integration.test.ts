import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/db'

describe('Products API Integration', () => {
  beforeAll(async () => {
    // Ensure we have test data
    const productCount = await prisma.product.count()
    if (productCount === 0) {
      throw new Error('No products found in database. Run seed script first.')
    }
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('GET /api/products', () => {
    it('should return products with pagination via HTTP', async () => {
      const response = await fetch('http://localhost:3000/api/products')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('products')
      expect(data).toHaveProperty('pagination')
      expect(Array.isArray(data.products)).toBe(true)
      expect(data.pagination).toHaveProperty('total')
      expect(data.pagination).toHaveProperty('limit')
      expect(data.pagination).toHaveProperty('offset')
      expect(data.pagination).toHaveProperty('hasMore')
    })

    it('should return products with complete data structure', async () => {
      const response = await fetch('http://localhost:3000/api/products')
      const data = await response.json()

      expect(data.products.length).toBeGreaterThan(0)
      
      const product = data.products[0]
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('title')
      expect(product).toHaveProperty('slug')
      expect(product).toHaveProperty('category')
      expect(product).toHaveProperty('variants')
      expect(product).toHaveProperty('options')
      expect(product).toHaveProperty('media')
      
      // Check category structure
      expect(product.category).toHaveProperty('name')
      expect(product.category).toHaveProperty('slug')
      
      // Check variants structure
      if (product.variants.length > 0) {
        const variant = product.variants[0]
        expect(variant).toHaveProperty('id')
        expect(variant).toHaveProperty('sku')
        expect(variant).toHaveProperty('price')
        expect(variant).toHaveProperty('inventory')
        expect(variant).toHaveProperty('options')
      }
    })

    it('should filter products by category', async () => {
      const response = await fetch('http://localhost:3000/api/products?category=coffee-tables')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.products.length).toBeGreaterThan(0)
      
      // All products should be from coffee-tables category
      data.products.forEach((product: any) => {
        expect(product.category.slug).toBe('coffee-tables')
      })
    })
  })

  describe('GET /api/products/[slug]', () => {
    it('should return a specific product by slug', async () => {
      const response = await fetch('http://localhost:3000/api/products/modern-glass-coffee-table')
      const product = await response.json()

      expect(response.status).toBe(200)
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('title')
      expect(product.slug).toBe('modern-glass-coffee-table')
      expect(product).toHaveProperty('variants')
      expect(product).toHaveProperty('options')
      expect(product).toHaveProperty('media')
    })

    it('should return 404 for non-existent product', async () => {
      const response = await fetch('http://localhost:3000/api/products/non-existent-product')

      expect(response.status).toBe(404)
    })

    it('should return product with complete variant data', async () => {
      const response = await fetch('http://localhost:3000/api/products/modern-glass-coffee-table')
      const product = await response.json()

      expect(product.variants.length).toBeGreaterThan(0)
      
      const variant = product.variants[0]
      expect(variant).toHaveProperty('options')
      expect(Array.isArray(variant.options)).toBe(true)
      
      if (variant.options.length > 0) {
        const option = variant.options[0]
        expect(option).toHaveProperty('value')
        expect(option).toHaveProperty('option')
        expect(option.option).toHaveProperty('name')
      }
    })
  })

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const response = await fetch('http://localhost:3000/api/categories')
      const categories = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(categories)).toBe(true)
      expect(categories.length).toBeGreaterThan(0)
    })

    it('should return categories with correct structure', async () => {
      const response = await fetch('http://localhost:3000/api/categories')
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
      const response = await fetch('http://localhost:3000/api/categories')
      const categories = await response.json()

      categories.forEach((category: any) => {
        expect(typeof category._count.products).toBe('number')
        expect(category._count.products).toBeGreaterThanOrEqual(0)
      })
    })

    it('should return categories with expected names', async () => {
      const response = await fetch('http://localhost:3000/api/categories')
      const categories = await response.json()

      const categoryNames = categories.map((cat: any) => cat.name)
      expect(categoryNames).toContain('Coffee Tables')
      expect(categoryNames).toContain('Desks')
      expect(categoryNames).toContain('Chairs')
    })
  })
})
