import { NextResponse } from 'next/server'

// Cache configuration for different types of data
export const CACHE_CONFIG = {
  products: {
    maxAge: 60, // 1 minute
    staleWhileRevalidate: 300, // 5 minutes
  },
  categories: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 600, // 10 minutes
  },
  seoSettings: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 600, // 10 minutes
  },
  orders: {
    maxAge: 30, // 30 seconds
    staleWhileRevalidate: 120, // 2 minutes
  },
} as const

// Helper function to create cache headers
export function createCacheHeaders(config: { maxAge: number; staleWhileRevalidate: number }) {
  return {
    'Cache-Control': `s-maxage=${config.maxAge}, stale-while-revalidate=${config.staleWhileRevalidate}`,
    'CDN-Cache-Control': `s-maxage=${config.maxAge}`,
    'Vercel-CDN-Cache-Control': `s-maxage=${config.maxAge}`,
  }
}

// Wrapper function for cached API responses
export function cachedResponse(data: any, cacheType: keyof typeof CACHE_CONFIG) {
  const headers = createCacheHeaders(CACHE_CONFIG[cacheType])
  
  return NextResponse.json(data, {
    headers,
  })
}

// In-memory cache for frequently accessed data
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttlSeconds: number = 300) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    for (const [key, item] of entries) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const memoryCache = new MemoryCache()

// Auto cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    memoryCache.cleanup()
  }, 5 * 60 * 1000)
}

// Cache key generators
export const cacheKeys = {
  products: (page?: number, limit?: number, category?: string) => 
    `products:${page || 'all'}:${limit || 'all'}:${category || 'all'}`,
  product: (slug: string) => `product:${slug}`,
  categories: () => 'categories:all',
  seoSettings: () => 'seo:settings',
  orders: (page?: number, status?: string) => 
    `orders:${page || 'all'}:${status || 'all'}`,
}
