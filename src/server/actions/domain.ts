'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getTenant } from '@/lib/tenant'
import { addDomain, getDomain, removeDomain } from '@/lib/vercel-domains'

const DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z0-9-]{1,63})+$/i

async function requireTenantOwner() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined
  const tenant = await getTenant()
  if (!tenant || !userId) throw new Error('Not authorised')
  const member = await db.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId: tenant.id, userId } },
  })
  if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
    throw new Error('Only OWNER or ADMIN can manage domains')
  }
  return { tenant, userId }
}

export type DomainResult =
  | { ok: true; domain: string; verified: boolean; instructions?: string[] }
  | { ok: false; error: string }

export async function attachDomain(raw: string): Promise<DomainResult> {
  try {
    const domain = raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    if (!DOMAIN_RE.test(domain)) return { ok: false, error: 'Enter a valid domain (e.g. shop.example.com)' }

    const { tenant } = await requireTenantOwner()

    // Guard: not already claimed by another tenant.
    const existing = await db.tenant.findUnique({ where: { customDomain: domain }, select: { id: true } })
    if (existing && existing.id !== tenant.id) {
      return { ok: false, error: 'That domain is already attached to another store' }
    }

    const created = await addDomain(domain)
    await db.tenant.update({
      where: { id: tenant.id },
      data: {
        customDomain: domain,
        customDomainVerifiedAt: created.verified ? new Date() : null,
      },
    })
    revalidatePath('/admin/domain')

    const instructions = (created.verification ?? []).map((v) => `${v.type} ${v.domain} → ${v.value}`)
    return { ok: true, domain, verified: !!created.verified, instructions }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) }
  }
}

export async function checkDomain(): Promise<DomainResult> {
  try {
    const { tenant } = await requireTenantOwner()
    if (!tenant.customDomain) return { ok: false, error: 'No domain attached' }

    const info = await getDomain(tenant.customDomain)
    if (info.verified && !tenant.customDomainVerifiedAt) {
      await db.tenant.update({
        where: { id: tenant.id },
        data: { customDomainVerifiedAt: new Date() },
      })
    }
    revalidatePath('/admin/domain')
    return {
      ok: true,
      domain: tenant.customDomain,
      verified: !!info.verified,
      instructions: (info.verification ?? []).map((v) => `${v.type} ${v.domain} → ${v.value}`),
    }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) }
  }
}

export async function detachDomain(): Promise<{ ok: boolean; error?: string }> {
  try {
    const { tenant } = await requireTenantOwner()
    if (!tenant.customDomain) return { ok: true }
    try {
      await removeDomain(tenant.customDomain)
    } catch (err: any) {
      // ponytail: swallow "not found" so a stale local pointer can be cleared
      // even when Vercel already lost the record.
      if (!/not.?found|404/i.test(err?.message ?? '')) throw err
    }
    await db.tenant.update({
      where: { id: tenant.id },
      data: { customDomain: null, customDomainVerifiedAt: null },
    })
    revalidatePath('/admin/domain')
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) }
  }
}
