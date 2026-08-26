import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingBag, Truck, Ticket, MegaphoneIcon, Globe, BarChart3,
  ArrowRight, Check, Zap, Shield, Phone,
} from 'lucide-react'

export const metadata = {
  title: 'Storely — Commerce OS for cash-on-delivery merchants',
  description:
    'Launch a mobile-first storefront, ship orders, and run promotions in one place. Built for MENA merchants selling on cash on delivery.',
}

export default function StorelyLanding() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50" />
        <div className="absolute -top-24 -right-24 -z-10 w-96 h-96 rounded-full bg-fuchsia-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 -z-10 w-96 h-96 rounded-full bg-indigo-200/40 blur-3xl" />

        <div className="container mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-100">
              <Zap className="w-3.5 h-3.5 mr-1.5" /> Now in beta
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
              The commerce OS built for{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                cash-on-delivery
              </span>{' '}
              merchants.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
              Launch a mobile-first storefront, verify COD orders with SMS OTP, run coupons
              and popups, and hand off to your courier — all from one admin. No plugins to
              install, no theme to code.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 h-12 px-6">
                <Link href="/pricing">
                  Start 14-day free trial <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <Link href="/">See a live storefront</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              No credit card required · Cancel anytime · Setup in under 10 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-slate-200 bg-slate-50/60">
        <div className="container mx-auto max-w-7xl px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-slate-500">
          <span>Trusted by merchants across MENA</span>
          <span className="opacity-40">•</span>
          <span>10,000+ orders processed</span>
          <span className="opacity-40">•</span>
          <span>Arabic &amp; English</span>
          <span className="opacity-40">•</span>
          <span>Bosta &amp; Aramex export</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="max-w-2xl mb-14">
          <div className="text-sm font-semibold text-indigo-600 mb-3">Everything you need</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            One admin. Every part of the shop.
          </h2>
          <p className="text-lg text-slate-600">
            Stop stitching plugins. Storely ships with the modules real COD merchants use every
            day — products, orders, promotions, and support.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-950 text-white">
        <div className="container mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-2xl mb-14">
            <div className="text-sm font-semibold text-fuchsia-400 mb-3">How it works</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              From signup to first order in an afternoon.
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title}>
                <div className="text-5xl font-bold text-slate-700 mb-3">0{i + 1}</div>
                <h3 className="font-semibold text-xl mb-2">{s.title}</h3>
                <p className="text-slate-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="container mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid gap-6 md:grid-cols-3">
          <Guarantee icon={Shield} title="No lock-in">
            Export your products, orders, and customers as CSV at any time.
          </Guarantee>
          <Guarantee icon={Truck} title="Courier-ready">
            One click to export waybill-ready CSVs for Bosta, Aramex, and local couriers.
          </Guarantee>
          <Guarantee icon={Phone} title="Real humans">
            Every plan includes chat support from a person who has run a shop.
          </Guarantee>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto max-w-4xl px-6 py-20 md:py-28">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">
            Frequently asked
          </h2>
          <dl className="divide-y divide-slate-200">
            {FAQS.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="font-semibold text-lg mb-2">{f.q}</dt>
                <dd className="text-slate-600 leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Big CTA */}
      <section className="container mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Ready to sell smarter?
          </h2>
          <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Start free for 14 days. Bring your products. We'll bring the storefront, the
            admin, and the courier hand-off.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-6">
              <Link href="/pricing">See pricing</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 border-white/40 text-white hover:bg-white/10 hover:text-white">
              <Link href="/contact">Talk to us</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

const FEATURES = [
  { icon: ShoppingBag, title: 'Storefront that just works',
    body: 'Mobile-first, RTL-ready, product variants, wishlists, reviews — all pre-wired.' },
  { icon: Truck, title: 'COD-first checkout',
    body: 'Optional SMS OTP verification, address collection tuned for MENA, courier CSV export.' },
  { icon: Ticket, title: 'Coupons & promotions',
    body: 'Percentage, fixed, and free-ship coupons with usage limits and per-customer caps.' },
  { icon: MegaphoneIcon, title: 'Popups with targeting',
    body: 'Show the right offer to the right visitor. Frequency capping, A/B split, path targeting.' },
  { icon: Globe, title: 'Arabic + English out of the box',
    body: 'Locale-aware SEO, RTL-friendly components, currency and timezone per store.' },
  { icon: BarChart3, title: 'The metrics that matter',
    body: 'Orders, revenue, low-stock alerts, coupon usage, popup performance — one dashboard.' },
]

const STEPS = [
  { title: 'Sign up',
    body: 'Pick a subdomain, tell us your store name, and we spin up your storefront with sample products.' },
  { title: 'Add your catalog',
    body: 'Upload products with variants (color, size), pricing, and inventory. Or import from a CSV.' },
  { title: 'Take your first order',
    body: 'Share the link. Orders land in the admin, verified by OTP, ready to ship.' },
]

const FAQS = [
  { q: 'Do I need to install anything?',
    a: 'No. Storely is fully hosted. Sign up and start selling on your own subdomain in minutes. Upgrade to a paid plan to connect a custom domain.' },
  { q: 'Which payment methods are supported?',
    a: 'Cash on delivery is the default. Card and wallet integrations (Paymob, Stripe) are in the roadmap and available on request.' },
  { q: 'Can I export my data?',
    a: 'Yes. Products, orders, and customers can be exported as CSV at any time. Your data is yours.' },
  { q: 'Is there a free plan?',
    a: 'Every plan starts with a 14-day free trial — no credit card required. See the pricing page for what each tier includes.' },
  { q: 'Do you help with setup?',
    a: 'Yes. Every paid plan includes onboarding chat. A one-time white-glove setup service is available if you would like us to migrate your catalog and configure everything for you.' },
]

function Guarantee({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-11 h-11 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-semibold text-lg mb-1 flex items-center gap-2">
          {title} <Check className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-slate-600 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
