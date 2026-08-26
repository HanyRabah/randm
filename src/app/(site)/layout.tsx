import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

// ponytail: multi-tenant storefront — content resolves per Host at
// request time via the Prisma tenant-scoping extension. Skipping build-
// time prerender also avoids the chicken-and-egg where the build DB
// hasn't been migrated to the latest schema yet.
export const dynamic = 'force-dynamic'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
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
