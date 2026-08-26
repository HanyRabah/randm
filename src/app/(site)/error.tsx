'use client'

// ponytail: temporary diagnostic — surfaces the real server error into
// the DOM so we can see WHAT is crashing under a signed-in session on
// the empty-catalog tenant. Remove once the underlying crash is fixed.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-4">
        <h1 className="text-2xl font-bold">Storefront crashed</h1>
        <p className="text-slate-600">
          Digest: <code className="font-mono text-sm">{error.digest ?? 'n/a'}</code>
        </p>
        <details open className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer font-medium">Error</summary>
          <pre className="mt-3 text-xs whitespace-pre-wrap break-words text-red-700">
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
