import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/storely" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="inline-block w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-fuchsia-600" />
            Storely
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="/storely#features" className="hover:text-slate-900">Features</a>
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            <a href="/storely#faq" className="hover:text-slate-900">FAQ</a>
            <Link href="/" className="hover:text-slate-900">Live demo</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="text-sm text-slate-600 hover:text-slate-900 hidden sm:inline">
              Sign in
            </Link>
            <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-800">
              <Link href="/signup">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 mt-24">
        <div className="container mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-4 text-sm text-slate-600">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-3">
              <span className="inline-block w-6 h-6 rounded-md bg-gradient-to-br from-indigo-600 to-fuchsia-600" />
              Storely
            </div>
            <p>The commerce OS for merchants who sell on cash on delivery.</p>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-3">Product</div>
            <ul className="space-y-2">
              <li><a href="/storely#features" className="hover:text-slate-900">Features</a></li>
              <li><Link href="/pricing" className="hover:text-slate-900">Pricing</Link></li>
              <li><Link href="/" className="hover:text-slate-900">Live demo</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-3">Company</div>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-slate-900">About</Link></li>
              <li><Link href="/contact" className="hover:text-slate-900">Contact</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-3">Legal</div>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-slate-900">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-slate-900">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Storely. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
