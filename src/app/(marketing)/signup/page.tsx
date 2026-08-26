'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { signup, checkSlug } from '@/server/actions/signup'

type SlugState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'ok' }
  | { status: 'bad'; reason: string }

export default function SignupPage() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
    slug: '',
  })
  const [slugState, setSlugState] = useState<SlugState>({ status: 'idle' })

  // Auto-suggest slug from store name until the merchant edits it.
  const [slugTouched, setSlugTouched] = useState(false)
  useEffect(() => {
    if (slugTouched) return
    const suggested = form.storeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 32)
    setForm((f) => ({ ...f, slug: suggested }))
  }, [form.storeName, slugTouched])

  // Debounced slug availability check.
  useEffect(() => {
    if (!form.slug) return setSlugState({ status: 'idle' })
    setSlugState({ status: 'checking' })
    const t = setTimeout(async () => {
      const res = await checkSlug(form.slug)
      setSlugState(res.available ? { status: 'ok' } : { status: 'bad', reason: res.reason ?? 'Unavailable' })
    }, 350)
    return () => clearTimeout(t)
  }, [form.slug])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await signup(form)
      if (!result.ok) {
        setError(result.error)
        return
      }
      // Sign the new merchant in and land them on their admin.
      const signInResult = await signIn('admin-credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (signInResult?.error) {
        // Signup succeeded but auto sign-in failed — send them to signin.
        router.push(`/auth/signin?email=${encodeURIComponent(form.email)}`)
        return
      }
      window.location.href = '/onboarding'
    })
  }

  return (
    <section className="container mx-auto max-w-lg px-6 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Create your store
        </h1>
        <p className="text-slate-600">
          14-day free trial. No credit card. Cancel anytime.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 bg-white p-8 rounded-2xl border border-slate-200">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Field label="Store name" htmlFor="storeName">
          <Input
            id="storeName" required autoFocus
            value={form.storeName}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
            placeholder="Acme Furniture"
          />
        </Field>

        <Field label="Subdomain" htmlFor="slug">
          <div className="flex items-center rounded-md border border-slate-300 focus-within:ring-2 focus-within:ring-slate-900/10 overflow-hidden">
            <Input
              id="slug" required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                setForm({ ...form, slug: e.target.value.toLowerCase() })
              }}
              className="border-0 focus-visible:ring-0"
              placeholder="acme-furniture"
            />
            <span className="px-3 py-2 text-sm text-slate-500 bg-slate-50 border-l border-slate-200 shrink-0">
              .storely.app
            </span>
          </div>
          <SlugStatus state={slugState} />
        </Field>

        <div className="pt-2 border-t border-slate-100" />

        <Field label="Your name" htmlFor="name">
          <Input
            id="name" required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Merchant"
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <Input
            id="email" required type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <Input
            id="password" required type="password" minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters"
          />
        </Field>

        <Button
          type="submit" size="lg"
          className="w-full h-11 bg-slate-900 hover:bg-slate-800"
          disabled={pending || slugState.status === 'bad' || slugState.status === 'checking'}
        >
          {pending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating your store…</>
          ) : (
            <>Create store <ArrowRight className="ml-2 w-4 h-4" /></>
          )}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Already have a store?{' '}
          <Link href="/auth/signin" className="text-slate-900 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </section>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">{label}</Label>
      {children}
    </div>
  )
}

function SlugStatus({ state }: { state: SlugState }) {
  if (state.status === 'idle') return null
  if (state.status === 'checking') return <p className="text-xs text-slate-500 mt-1">Checking…</p>
  if (state.status === 'ok')
    return (
      <p className="text-xs text-emerald-600 mt-1 inline-flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Available
      </p>
    )
  return (
    <p className="text-xs text-red-600 mt-1 inline-flex items-center gap-1">
      <XCircle className="w-3 h-3" /> {state.reason}
    </p>
  )
}
