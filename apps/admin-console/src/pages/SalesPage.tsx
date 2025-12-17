import React, { useState } from 'react'

const API_BASE = 'https://rinawarptech.com'

type LifetimeResponse = {
  product: string
  count: number
}

export const SalesPage: React.FC = () => {
  const [product, setProduct] = useState('terminal_pro')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LifetimeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchLifetimeCount = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API_BASE}/api/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'get_lifetime_count',
          product
        })
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status}: ${text}`)
      }

      const data = await res.json()
      setResult({
        product: data.product ?? product,
        count: data.count ?? 0
      })
    } catch (err: any) {
      setError(err.message ?? 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-lg font-semibold">Sales & Analytics</h2>
      <p className="text-slate-300">
        Query Cloudflare KV-backed analytics via the <code>/api/analytics</code> endpoint.
      </p>

      <div className="rounded-xl border border-slate-800 p-4 space-y-3 max-w-lg">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400">Product key</label>
          <select
            value={product}
            onChange={e => setProduct(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="terminal_pro">terminal_pro</option>
            <option value="ai_music_video">ai_music_video</option>
            <option value="bundle_full">bundle_full</option>
          </select>
        </div>

        <button
          onClick={fetchLifetimeCount}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950 disabled:opacity-60"
        >
          {loading ? 'Querying…' : 'Get lifetime sales'}
        </button>

        {result && (
          <div className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
            <div className="text-xs text-slate-400 mb-1">Result</div>
            <div className="text-sm">
              <span className="font-mono">{result.product}</span> →{' '}
              <span className="font-semibold">{result.count}</span> sales
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-rose-700 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
            Error: {error}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500">
        This is read-only in production. Mutating actions (like <code>record_sale</code>) should be
        restricted to internal tooling only and protected via Cloudflare Access or VPN.
      </div>
    </div>
  )
}
