import { Fragment } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Minus, Sparkles, Wrench, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Pricing — Rana',
  description:
    'Simple pricing. Start free, grow as you sell. Plans include storefront, admin, coupons, popups, and courier export.',
}

type Plan = {
  name: string
  price: string
  cadence: string
  tagline: string
  cta: string
  ctaHref: string
  highlight?: boolean
  features: string[]
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: 'FREE',
    cadence: '14-day trial, then $29/mo',
    tagline: 'Everything you need to open the store.',
    cta: 'Start free trial',
    ctaHref: '/auth/customer-signin',
    features: [
      'Up to 100 products',
      '500 orders / month',
      'Rana subdomain (yourstore.rana.app)',
      'Cash on delivery + SMS OTP',
      'Coupons & basic popups',
      'Courier CSV export',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    price: '$79',
    cadence: 'per month',
    tagline: 'For shops taking off.',
    cta: 'Start Growth trial',
    ctaHref: '/auth/customer-signin',
    highlight: true,
    features: [
      'Unlimited products',
      '5,000 orders / month',
      'Custom domain',
      'All Starter features',
      'Advanced popups (A/B, targeting)',
      'Reviews & wishlists',
      'Newsletter campaigns',
      'Priority chat support',
    ],
  },
  {
    name: 'Scale',
    price: '$199',
    cadence: 'per month',
    tagline: 'For established brands.',
    cta: 'Talk to sales',
    ctaHref: '/contact',
    features: [
      'Unlimited orders',
      'Multiple staff accounts',
      'All Growth features',
      'Advanced analytics',
      'API access',
      'Custom courier integrations',
      'Dedicated onboarding manager',
      'SLA-backed support',
    ],
  },
]

const MATRIX: { section: string; rows: { label: string; starter: string | boolean; growth: string | boolean; scale: string | boolean }[] }[] = [
  {
    section: 'Storefront',
    rows: [
      { label: 'Products',       starter: 'Up to 100',     growth: 'Unlimited', scale: 'Unlimited' },
      { label: 'Orders / month', starter: '500',           growth: '5,000',     scale: 'Unlimited' },
      { label: 'Rana subdomain', starter: true,            growth: true,        scale: true },
      { label: 'Custom domain',  starter: false,           growth: true,        scale: true },
      { label: 'RTL + Arabic',   starter: true,            growth: true,        scale: true },
    ],
  },
  {
    section: 'Commerce',
    rows: [
      { label: 'Cash on delivery',    starter: true,  growth: true,  scale: true },
      { label: 'SMS OTP verification', starter: true, growth: true,  scale: true },
      { label: 'Coupons',              starter: 'Basic', growth: 'Advanced', scale: 'Advanced' },
      { label: 'Popups (A/B, targeting)', starter: false, growth: true, scale: true },
      { label: 'Reviews & wishlists',  starter: false, growth: true,  scale: true },
      { label: 'Courier CSV export',   starter: true,  growth: true,  scale: true },
      { label: 'Custom courier integrations', starter: false, growth: false, scale: true },
    ],
  },
  {
    section: 'Team & support',
    rows: [
      { label: 'Staff accounts',    starter: '1',       growth: '5',        scale: 'Unlimited' },
      { label: 'Support channel',   starter: 'Email',   growth: 'Priority chat', scale: 'Dedicated' },
      { label: 'Onboarding',        starter: 'Docs',    growth: 'Guided',   scale: 'White-glove' },
      { label: 'SLA',               starter: false,     growth: false,      scale: true },
    ],
  },
]

const FAQS = [
  { q: 'Can I change plans later?', a: 'Yes. Upgrade or downgrade at any time. Changes prorate to your next invoice.' },
  { q: 'What happens after the trial?', a: 'You keep your data. If you do not enter a card, your store pauses (visitors see a friendly page) until you subscribe.' },
  { q: 'Do you charge per order?', a: 'No transaction fees. You pay the flat subscription — your revenue stays yours.' },
  { q: 'Which currencies can I sell in?', a: 'Any single currency per store (EGP, SAR, AED, USD, EUR, and more). Multi-currency is on the roadmap.' },
  { q: 'Can I move my catalog from another platform?', a: 'Yes. Import via CSV, or add the one-time Concierge setup and we will migrate everything for you.' },
]

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-indigo-50/60 to-white">
        <div className="container mx-auto max-w-7xl px-6 py-20 text-center">
          <Badge className="mb-6 bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-100">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Simple, transparent pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Pick the plan that fits your shop.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Start free for 14 days. No credit card. No transaction fees, ever.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="container mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={
                'relative rounded-2xl border p-8 flex flex-col ' +
                (p.highlight
                  ? 'border-indigo-500 bg-white shadow-xl ring-1 ring-indigo-500/20'
                  : 'border-slate-200 bg-white')
              }
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white text-xs font-semibold shadow">
                    <Sparkles className="w-3 h-3" /> Most popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  {p.name}
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">{p.price}</span>
                  <span className="text-slate-500 text-sm">{p.cadence}</span>
                </div>
                <p className="mt-3 text-slate-600">{p.tagline}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                    <span className="text-slate-700">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                className={
                  'h-11 ' +
                  (p.highlight
                    ? 'bg-slate-900 hover:bg-slate-800'
                    : 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50')
                }
              >
                <Link href={p.ctaHref}>
                  {p.cta} <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-500 mt-8">
          Prices shown in USD. Local currency billing available on Growth and Scale.
        </p>
      </section>

      {/* Setup service */}
      <section className="container mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-amber-700 mb-1">Concierge setup · one-time</div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">
              Prefer we set it up for you?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Send us your catalog, logo, and courier details. Within 5 business days, your
              store is ready to take orders — catalog imported, branding applied, payment
              and shipping configured, staff trained.
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold">$499</div>
            <div className="text-sm text-slate-500 mb-3">one-time</div>
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link href="/contact?topic=concierge">Book concierge</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature matrix */}
      <section className="border-t border-slate-200 bg-slate-50/60">
        <div className="container mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Compare plans
          </h2>
          <p className="text-slate-600 mb-10">Everything in each plan, side by side.</p>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="p-4 font-semibold text-slate-700 w-1/2">Feature</th>
                  <th className="p-4 font-semibold text-slate-700">Starter</th>
                  <th className="p-4 font-semibold text-slate-700 bg-indigo-50/50">Growth</th>
                  <th className="p-4 font-semibold text-slate-700">Scale</th>
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((section) => (
                  <Fragment key={section.section}>
                    <tr className="border-b border-slate-200 bg-slate-50/60">
                      <td colSpan={4} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {section.section}
                      </td>
                    </tr>
                    {section.rows.map((row) => (
                      <tr key={row.label} className="border-b border-slate-100 last:border-0">
                        <td className="p-4 text-slate-700">{row.label}</td>
                        <td className="p-4"><Cell v={row.starter} /></td>
                        <td className="p-4 bg-indigo-50/30"><Cell v={row.growth} /></td>
                        <td className="p-4"><Cell v={row.scale} /></td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10 text-center">
          Pricing FAQ
        </h2>
        <dl className="divide-y divide-slate-200">
          {FAQS.map((f) => (
            <div key={f.q} className="py-6">
              <dt className="font-semibold text-lg mb-2">{f.q}</dt>
              <dd className="text-slate-600 leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl bg-slate-950 text-white p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Try Rana free for 14 days.
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
            No card. No transaction fees. Cancel anytime — take your data with you.
          </p>
          <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-6">
            <Link href="/auth/customer-signin">
              Start free trial <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="w-4 h-4 text-emerald-500" />
  if (v === false) return <Minus className="w-4 h-4 text-slate-300" />
  return <span className="text-slate-700">{v}</span>
}
