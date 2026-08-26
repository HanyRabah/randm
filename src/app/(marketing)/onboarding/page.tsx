import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, LayoutDashboard, Store, Package, Truck } from 'lucide-react'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Welcome to Storely' }

export default async function OnboardingPage() {
  const slug = cookies().get('storely_tenant')?.value
  if (!slug) redirect('/signup')

  const tenant = await db.tenant.findUnique({ where: { slug } })
  if (!tenant) redirect('/signup')

  return (
    <section className="container mx-auto max-w-3xl px-6 py-16">
      <div className="text-center mb-10">
        <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Welcome to Storely, {tenant.name}.
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          Your store is live. Here is what to do next — most merchants finish
          setup in under an hour.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Your storefront
          </div>
          <div className="font-mono text-lg font-semibold">
            {tenant.slug}.storely.app
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Point a custom domain here once you upgrade.
          </p>
        </div>
        <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 shrink-0">
          <Link href="/admin">
            <LayoutDashboard className="w-4 h-4 mr-2" /> Open admin
          </Link>
        </Button>
      </div>

      <ol className="space-y-3">
        <Step n={1} icon={Store} title="Brand your storefront" href="/admin/seo-settings">
          Upload a logo, set your language, currency, and social links.
        </Step>
        <Step n={2} icon={Package} title="Add your first products" href="/admin/products">
          Import a CSV or create products with variants (color, size, price).
        </Step>
        <Step n={3} icon={Truck} title="Set up your courier" href="/admin/orders">
          Rana ships with Bosta/Aramex CSV export. Configure it before your first order.
        </Step>
      </ol>

      <p className="text-center text-sm text-slate-500 mt-10">
        Need a hand?{' '}
        <Link href="/contact?topic=onboarding" className="text-slate-900 font-medium hover:underline">
          We can set this up for you
        </Link>.
      </p>
    </section>
  )
}

function Step({
  n, icon: Icon, title, href, children,
}: { n: number; icon: any; title: string; href: string; children: React.ReactNode }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 flex items-start gap-4 hover:border-slate-300 transition">
      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="text-xs font-semibold text-slate-500 mb-0.5">Step {n}</div>
        <Link href={href} className="font-semibold text-slate-900 hover:underline">
          {title}
        </Link>
        <p className="text-sm text-slate-600 mt-1">{children}</p>
      </div>
    </li>
  )
}
