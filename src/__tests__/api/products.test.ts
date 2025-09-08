import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { GET } from '@/app/api/products/route'
import { GET as getProductBySlug } from '@/app/api/products/[slug]/route'
import { prisma } from '@/lib/db'

describe('/api/products', () => {
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
    it('should return products with pagination', async () => {
      const request = new Request('http://localhost:3000/api/products')
      const response = await GET(request)
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
      const request = new Request('http://localhost:3000/api/products')
      const response = await GET(request)
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
      const request = new Request('http://localhost:3000/api/products?category=coffee-tables')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.products.length).toBeGreaterThan(0)
      
      // All products should be from coffee-tables category
      data.products.forEach((product: any) => {
        expect(product.category.slug).toBe('coffee-tables')
      })
    })

    it('should respect limit parameter', async () => {
      const request = new Request('http://localhost:3000/api/products?limit=1')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.products.length).toBeLessThanOrEqual(1)
      expect(data.pagination.limit).toBe(1)
    })
  })

  describe('GET /api/products/[slug]', () => {
    it('should return a specific product by slug', async () => {
      const request = new Request('http://localhost:3000/api/products/modern-glass-coffee-table')
      const response = await getProductBySlug(request, { params: { slug: 'modern-glass-coffee-table' } })
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
      const request = new Request('http://localhost:3000/api/products/non-existent-product')
      const response = await getProductBySlug(request, { params: { slug: 'non-existent-product' } })

      expect(response.status).toBe(404)
    })

    it('should return product with complete variant data', async () => {
      const request = new Request('http://localhost:3000/api/products/modern-glass-coffee-table')
      const response = await getProductBySlug(request, { params: { slug: 'modern-glass-coffee-table' } })
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
})
