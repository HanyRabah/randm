import { NextRequest, NextResponse } from 'next/server'

const TENANT_COOKIE = 'storely_tenant'
const TENANT_HEADER = 'x-tenant-slug'

// Bridges tenant context between the client and the request lifecycle:
//   - ?tenant=<slug> → sets the storely_tenant cookie and strips the query
//   - storely_tenant cookie → forwarded as x-tenant-slug header
//
// ponytail: this is the transitional path so signup can point a merchant
// at their tenant on the current preview URL. Once real Host-based routing
// is in (<slug>.storely.app), the cookie/query bridge can go away and the
// Prisma extension will resolve directly from Host.
export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const requested = url.searchParams.get('tenant')
  const cookieSlug = req.cookies.get(TENANT_COOKIE)?.value

  // Only bridge on non-static routes.
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/favicon') ||
    /\.[a-z0-9]+$/i.test(url.pathname)
  ) {
    return NextResponse.next()
  }

  const slug = requested || cookieSlug
  const headers = new Headers(req.headers)
  if (slug) headers.set(TENANT_HEADER, slug)

  // If the URL carried ?tenant=, persist it and clean the URL.
  if (requested) {
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

  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
