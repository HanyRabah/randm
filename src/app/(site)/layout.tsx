import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getSeoSettings } from '@/lib/seo'

// ponytail: multi-tenant storefront — content resolves per Host at
// request time via the Prisma tenant-scoping extension. Skipping build-
// time prerender also avoids the chicken-and-egg where the build DB
// hasn't been migrated to the latest schema yet.
export const dynamic = 'force-dynamic'

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const seo = await getSeoSettings()
  const primary = seo.primaryColor ?? '#111827'
  const accent = seo.accentColor ?? '#4f46e5'

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ ['--tenant-primary' as any]: primary, ['--tenant-accent' as any]: accent }}
    >
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
