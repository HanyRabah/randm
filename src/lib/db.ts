import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'
import { cache } from 'react'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const base =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = base

const APEX_HOST = process.env.STORELY_APEX_HOST || 'storely.app'
const DEFAULT_TENANT_SLUG = 'default'

function slugFromHost(host: string): string | null {
  if (!host) return null
  if (host === 'localhost' || host.startsWith('localhost:')) return null
  if (host.endsWith('.vercel.app')) return null
  if (host === APEX_HOST || host === `www.${APEX_HOST}`) return null
  if (host.endsWith(`.${APEX_HOST}`)) {
    const sub = host.slice(0, -(APEX_HOST.length + 1))
    return sub === 'www' ? null : sub
  }
  return null // custom domain — resolved separately
}

// Resolved once per React request. Returns null when there is no request
// context (background jobs, seed scripts) — the extension then bypasses
// scoping for that call.
const resolveTenantIdOnce = cache(async (): Promise<string | null> => {
  let h: ReturnType<typeof headers>
  try {
    h = headers()
  } catch {
    return null
  }

  const explicit = h.get('x-tenant-slug')
  const host = (h.get('x-forwarded-host') || h.get('host') || '').toLowerCase()
  const slug = explicit || slugFromHost(host)

  if (slug) {
    const t = await base.tenant.findUnique({ where: { slug } })
    if (t) return t.id
  }

  const isMarketing =
    !host ||
    host === 'localhost' ||
    host.startsWith('localhost:') ||
    host.endsWith('.vercel.app') ||
    host === APEX_HOST ||
    host === `www.${APEX_HOST}`

  if (!isMarketing && !slug) {
    const t = await base.tenant.findUnique({ where: { customDomain: host } })
    if (t) return t.id
  }

  // Single-tenant fallback: auto-provision the default tenant.
  // ponytail: remove this once signup provisions real tenants and legacy
  // rows have been backfilled.
  const def = await base.tenant.findUnique({ where: { slug: DEFAULT_TENANT_SLUG } })
  if (def) return def.id
  const created = await base.tenant.create({
    data: { slug: DEFAULT_TENANT_SLUG, name: 'Default Store' },
  })
  return created.id
})

// Models that carry a tenantId. Child models (Variant, OrderItem, Media,
// CartItem, ReviewMedia, OptionValue, ProductOption, ReviewVote,
// SupportMessage) reach tenant scope through their parent relation and
// are intentionally not listed.
const TENANT_MODELS = new Set([
  'Product',
  'Category',
  'Cart',
  'Order',
  'Coupon',
  'Popup',
  'NewsletterSubscriber',
  'NewsletterCampaign',
  'Review',
  'Wishlist',
  'Customer',
  'SupportTicket',
  'InventoryAlert',
  'SeoSettings',
])

export const db = base.$extends({
  name: 'tenant-scope',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }: any) {
        if (!TENANT_MODELS.has(model)) return query(args)
        const tenantId = await resolveTenantIdOnce()
        if (!tenantId) return query(args)

        switch (operation) {
          case 'findMany':
          case 'findFirst':
          case 'findFirstOrThrow':
          case 'count':
          case 'aggregate':
          case 'groupBy':
          case 'updateMany':
          case 'deleteMany':
            args.where = { ...(args.where ?? {}), tenantId }
            break
          case 'create':
            args.data = { ...(args.data ?? {}), tenantId }
            break
          case 'createMany':
            if (Array.isArray(args.data)) {
              args.data = args.data.map((d: any) => ({ ...d, tenantId }))
            } else if (args.data) {
              args.data = { ...args.data, tenantId }
            }
            break
          case 'upsert':
            args.create = { ...(args.create ?? {}), tenantId }
            break
          // findUnique / findUniqueOrThrow / update / delete take a unique
          // where. Ids are globally unique cuids, so leaving them unscoped
          // is safe. Slug/code/email are single-column unique today; add a
          // composite (tenantId, x) once tenantId is NOT NULL to close
          // the cross-tenant slug-collision gap.
        }
        return query(args)
      },
    },
  },
})

export const prisma = db
