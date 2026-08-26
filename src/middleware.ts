import { NextRequest, NextResponse } from 'next/server'

const TENANT_COOKIE = 'storely_tenant'
const TENANT_HEADER = 'x-tenant-slug'

// The apex host that serves the Storely marketing site. All other hosts
// are either <slug>.<APEX_HOST> tenant subdomains, custom domains
// resolved via Tenant.customDomain, or dev/preview hosts (localhost,
// *.vercel.app) — those fall back to the cookie/query bridge.
const APEX_HOST = (process.env.STORELY_APEX_HOST || 'storely.app').toLowerCase()

const MARKETING_HOSTS = new Set([APEX_HOST, `www.${APEX_HOST}`])

function stripPort(host: string) {
  const i = host.indexOf(':')
  return i === -1 ? host : host.slice(0, i)
}

function isDevHost(host: string) {
  const h = stripPort(host)
  return h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.vercel.app')
}

// Extract a tenant slug from Host, or null for the marketing site / a
// custom domain / an unrecognised host.
function slugFromHost(rawHost: string): string | null {
  const host = stripPort(rawHost.toLowerCase())
  if (!host) return null
  if (MARKETING_HOSTS.has(host)) return null

  // <slug>.storely.app — production subdomain
  const apexSuffix = `.${APEX_HOST}`
  if (host.endsWith(apexSuffix)) {
    const sub = host.slice(0, -apexSuffix.length)
    return sub && sub !== 'www' ? sub : null
  }

  // <slug>.localhost — for local dev without editing /etc/hosts
  if (host.endsWith('.localhost')) {
    const sub = host.slice(0, -'.localhost'.length)
    return sub && sub !== 'www' ? sub : null
  }

  return null // plain localhost, *.vercel.app, or an unrecognised custom domain
}

// Bridges tenant context between the client and the request lifecycle:
//   1. If Host is a tenant subdomain — authoritative, forward as header
//   2. Else if ?tenant=<slug> — set cookie AND header (dev/preview only)
//   3. Else if storely_tenant cookie — forward as header
export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const path = url.pathname

  if (path.startsWith('/_next') || path.startsWith('/favicon') || /\.[a-z0-9]+$/i.test(path)) {
    return NextResponse.next()
  }

  const host = req.headers.get('host') || ''
  const hostSlug = slugFromHost(host)
  const requested = url.searchParams.get('tenant')
  const cookieSlug = req.cookies.get(TENANT_COOKIE)?.value

  // Persist ?tenant=<slug> to cookie and strip the query, unless a real
  // subdomain is already resolving the tenant.
  if (requested && !hostSlug) {
    const clean = url.clone()
    clean.searchParams.delete('tenant')
    const res = NextResponse.redirect(clean)
    res.cookies.set(TENANT_COOKIE, requested, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    return res
  }

  const slug = hostSlug || (isDevHost(host) ? cookieSlug : null) || null

  const headers = new Headers(req.headers)
  if (slug) headers.set(TENANT_HEADER, slug)
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
