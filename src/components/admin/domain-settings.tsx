'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, AlertTriangle, Trash2, RefreshCw, Globe } from 'lucide-react'
import { attachDomain, checkDomain, detachDomain, type DomainResult } from '@/server/actions/domain'

type Props = {
  tenant: {
    slug: string
    customDomain: string | null
    customDomainVerifiedAt: string | null
  }
}

export function DomainSettings({ tenant }: Props) {
  const [domain, setDomain] = useState(tenant.customDomain ?? '')
  const [current, setCurrent] = useState(tenant.customDomain)
  const [verified, setVerified] = useState(!!tenant.customDomainVerifiedAt)
  const [instructions, setInstructions] = useState<string[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const applyResult = (res: DomainResult) => {
    if (!res.ok) { setError(res.error); return }
    setError(null)
    setCurrent(res.domain)
    setVerified(res.verified)
    setInstructions(res.instructions?.length ? res.instructions : null)
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <Globe className="w-6 h-6 text-slate-500" />
        <h1 className="text-2xl font-bold">Custom Domain</h1>
      </div>
      <p className="text-slate-600 mb-6">
        Point your own domain (e.g. <span className="font-mono">shop.example.com</span>) at your storefront.
      </p>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mb-6 text-sm text-slate-600">
        Your storefront is always reachable at{' '}
        <span className="font-mono font-medium text-slate-900">{tenant.slug}.storely.app</span>.
        A custom domain adds a second, branded URL — it does not replace the subdomain.
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {current ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 p-5 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Current domain
                </div>
                <div className="font-mono text-lg font-medium">{current}</div>
              </div>
              {verified ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                  <CheckCircle2 className="w-4 h-4" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                  <AlertTriangle className="w-4 h-4" /> Pending DNS
                </span>
              )}
            </div>

            {!verified && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Add these DNS records at your registrar:</div>
                {instructions?.length ? (
                  <pre className="rounded-md bg-slate-950 text-slate-100 text-xs p-3 overflow-x-auto">
                    {instructions.join('\n')}
                  </pre>
                ) : (
                  <pre className="rounded-md bg-slate-950 text-slate-100 text-xs p-3 overflow-x-auto">
                    {`A     ${current}     76.76.21.21
CNAME ${current}     cname.vercel-dns.com`}
                  </pre>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  DNS can take a few minutes to propagate. Click "Check status" after updating records.
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-5">
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => start(async () => applyResult(await checkDomain()))}
              >
                {pending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                Check status
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={pending}
                onClick={() => start(async () => {
                  const res = await detachDomain()
                  if (!res.ok) { setError(res.error ?? 'Failed to remove'); return }
                  setError(null); setCurrent(null); setVerified(false); setInstructions(null); setDomain('')
                })}
              >
                <Trash2 className="w-3 h-3 mr-1" /> Remove domain
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => { e.preventDefault(); start(async () => applyResult(await attachDomain(domain))) }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain" required
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="shop.example.com"
            />
          </div>
          <Button type="submit" disabled={pending || !domain}>
            {pending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding…</> : 'Add domain'}
          </Button>
        </form>
      )}
    </div>
  )
}
