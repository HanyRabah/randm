import { Redis } from '@upstash/redis'

// Use Upstash Redis in production, fallback for development
export const redis = process.env.REDIS_URL?.startsWith('https') 
  ? new Redis({
      url: process.env.REDIS_URL!,
      token: process.env.REDIS_TOKEN!,
    })
  : null // Disable Redis in development/local builds

// Rate limiting utilities
export async function rateLimit(
  identifier: string,
  limit: number,
  window: number
): Promise<{ success: boolean; remaining: number; reset: number }> {
  // Skip rate limiting if Redis is not available
  if (!redis) {
    return {
      success: true,
      remaining: limit - 1,
      reset: Date.now() + (window * 1000),
    }
  }

  const key = `rate_limit:${identifier}`
  const now = Date.now()
  const windowStart = now - window * 1000

  try {
    const current = await redis.get(key)
    const count = current ? parseInt(current as string) : 0

    if (count >= limit) {
      const ttl = await redis.ttl(key)
      return {
        success: false,
        remaining: 0,
        reset: now + (ttl * 1000),
      }
    }

    const pipeline = redis.pipeline()
    pipeline.incr(key)
    pipeline.expire(key, window)
    await pipeline.exec()

    return {
      success: true,
      remaining: limit - count - 1,
      reset: now + (window * 1000),
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // Allow request on Redis error
    return {
      success: true,
      remaining: limit - 1,
      reset: now + (window * 1000),
    }
  }
}
