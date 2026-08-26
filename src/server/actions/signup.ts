'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

// Uses the un-extended base client — signup runs BEFORE the merchant has a
// tenant, so the tenant-scoping extension would inject the fallback default
// tenant and silently write the new records into the wrong place.
const base = new PrismaClient()

const RESERVED_SLUGS = new Set([
  'www', 'app', 'admin', 'api', 'auth', 'signup', 'signin', 'login',
  'logout', 'pricing', 'storely', 'features', 'faq', 'about', 'contact',
  'blog', 'docs', 'help', 'support', 'settings', 'account', 'cart',
  'checkout', 'order', 'orders', 'product', 'products', 'category',
  'categories', 'search', 'static', 'public', 'assets', 'cdn',
])

const signupSchema = z.object({
  name: z.string().min(1, 'Your name is required').max(80),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  storeName: z.string().min(1, 'Store name is required').max(80),
  slug: z
    .string()
    .min(3, 'At least 3 characters')
    .max(32, 'At most 32 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers, hyphens'),
})

export type SignupInput = z.infer<typeof signupSchema>
export type SignupResult =
  | { ok: true; tenantSlug: string }
  | { ok: false; error: string; field?: keyof SignupInput }

export async function signup(input: SignupInput): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: first.message, field: first.path[0] as keyof SignupInput }
  }
  const data = parsed.data
  const slug = data.slug.toLowerCase()

  if (RESERVED_SLUGS.has(slug)) {
    return { ok: false, error: 'That subdomain is reserved', field: 'slug' }
  }

  try {
    const [emailTaken, slugTaken] = await Promise.all([
      base.user.findUnique({ where: { email: data.email }, select: { id: true } }),
      base.tenant.findUnique({ where: { slug }, select: { id: true } }),
    ])
    if (emailTaken) return { ok: false, error: 'That email is already registered', field: 'email' }
    if (slugTaken) return { ok: false, error: 'That subdomain is taken', field: 'slug' }

    const passwordHash = await bcrypt.hash(data.password, 10)
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

    await base.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { slug, name: data.storeName, trialEndsAt },
      })
      const user = await tx.user.create({
        data: { email: data.email, name: data.name, password: passwordHash, role: 'ADMIN' },
      })
      await tx.tenantMember.create({
        data: { tenantId: tenant.id, userId: user.id, role: 'OWNER' },
      })
      await tx.seoSettings.create({
        data: { tenantId: tenant.id, siteName: data.storeName },
      })
    })
  } catch (err: any) {
    console.error('[signup] error', err)
    return {
      ok: false,
      error: `Signup failed: ${err?.code ?? ''} ${err?.message ?? String(err)}`.slice(0, 500),
    }
  }

  // Point subsequent requests at the new tenant until real Host-based
  // routing is live. Middleware forwards this as x-tenant-slug.
  cookies().set('storely_tenant', slug, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return { ok: true, tenantSlug: slug }
}

// Cheap availability check for the client while the merchant types.
export async function checkSlug(slug: string): Promise<{ available: boolean; reason?: string }> {
  const s = slug.toLowerCase().trim()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) || s.length < 3 || s.length > 32) {
    return { available: false, reason: 'Invalid format' }
  }
  if (RESERVED_SLUGS.has(s)) return { available: false, reason: 'Reserved' }
  try {
    const taken = await base.tenant.findUnique({ where: { slug: s }, select: { id: true } })
    return taken ? { available: false, reason: 'Taken' } : { available: true }
  } catch (err: any) {
    console.error('[checkSlug] error', err)
    return { available: false, reason: `err:${err?.code ?? ''} ${err?.message ?? String(err)}`.slice(0, 200) }
  }
}
