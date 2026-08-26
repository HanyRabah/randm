import { headers } from 'next/headers'
import { cache } from 'react'
import { db } from './db'
import type { Tenant } from '@prisma/client'

// The apex host that serves the Storely marketing site. Anything else is
// either a tenant subdomain (<slug>.APEX_HOST) or a custom domain that
// resolves via Tenant.customDomain.
export const APEX_HOST = process.env.STORELY_APEX_HOST || 'storely.app'

// Hosts that are always the marketing site, never a tenant.
const MARKETING_HOSTS = new Set([APEX_HOST, `www.${APEX_HOST}`])

// ponytail: dev/preview hosts don't run under storely.app. Treat them as
// marketing until real host routing lands; a tenant can still be resolved
// explicitly via the x-tenant-slug header (useful for previews and tests).
function isMarketingHost(host: string) {
  if (MARKETING_HOSTS.has(host)) return true
  if (host === 'localhost' || host.startsWith('localhost:')) return true
  if (host.endsWith('.vercel.app')) return true
  return false
}

function slugFromHost(host: string): string | null {
  if (isMarketingHost(host)) return null
  const suffix = `.${APEX_HOST}`
  if (host.endsWith(suffix)) {
    const sub = host.slice(0, -suffix.length)
    if (!sub || sub === 'www') return null
    return sub
  }
  return null // custom-domain path handled by the caller
}

async function findTenantByHost(host: string): Promise<Tenant | null> {
  const slug = slugFromHost(host)
  if (slug) return db.tenant.findUnique({ where: { slug } })
  if (isMarketingHost(host)) return null
  return db.tenant.findUnique({ where: { customDomain: host } })
}

// Resolves the tenant for the current request via the Host header, or via
// an explicit x-tenant-slug header (previews, tests, admin impersonation).
// Cached per-request so repeated calls don't re-hit the DB.
export const getTenant = cache(async (): Promise<Tenant | null> => {
  const h = headers()
  const explicit = h.get('x-tenant-slug')
  if (explicit) return db.tenant.findUnique({ where: { slug: explicit } })

  const host = (h.get('x-forwarded-host') || h.get('host') || '').toLowerCase()
  if (!host) return null
  return findTenantByHost(host)
})

export async function requireTenant(): Promise<Tenant> {
  const t = await getTenant()
  if (!t) throw new Error('No tenant for this request')
  return t
}

// getTenantId returns the current request's tenantId, or the default tenant's
// id (creating it if missing). Used to scope queries during the transition
// from single-tenant to multi-tenant — every legacy row lives under the
// default tenant until a real signup flow provisions per-merchant tenants.
export const DEFAULT_TENANT_SLUG = 'default'

export const getOrCreateDefaultTenant = cache(async (): Promise<Tenant> => {
  const existing = await db.tenant.findUnique({ where: { slug: DEFAULT_TENANT_SLUG } })
  if (existing) return existing
  return db.tenant.create({
    data: { slug: DEFAULT_TENANT_SLUG, name: 'Default Store' },
  })
})

export const getTenantId = cache(async (): Promise<string> => {
  const t = (await getTenant()) ?? (await getOrCreateDefaultTenant())
  return t.id
})

// Convenience for Prisma `where` clauses. Callers can spread it into any
// business-model where: `{ ...(await tenantScope()), status: 'PUBLISHED' }`.
export async function tenantScope(): Promise<{ tenantId: string }> {
  return { tenantId: await getTenantId() }
}
