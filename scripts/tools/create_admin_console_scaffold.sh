#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_DIR="$ROOT/apps/admin-console"

echo "RinaWarp Admin Console scaffold"
echo "Root: $ROOT"
echo "App dir: $APP_DIR"
echo

# 1. Create base directories
mkdir -p "$APP_DIR/src/components"
mkdir -p "$APP_DIR/src/pages"
mkdir -p "$APP_DIR/src/lib"
mkdir -p "$APP_DIR/public"

# 2. package.json (safe: only if missing)
PKG="$APP_DIR/package.json"
if [[ -f "$PKG" ]]; then
  echo "package.json already exists, skipping."
else
  cat > "$PKG" <<'EOF'
{
  "name": "rinawarp-admin-console",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --max-warnings=0",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@types/node": "^22.9.0",
    "@vitejs/plugin-react-swc": "^3.7.0",
    "eslint": "^9.12.0",
    "eslint-config-standard-with-typescript": "^43.0.0",
    "eslint-plugin-import": "^2.31.0",
    "eslint-plugin-n": "^17.10.0",
    "eslint-plugin-promise": "^7.10.0",
    "typescript": "^5.6.3",
    "vite": "^5.4.0"
  }
}
EOF
  echo "Created package.json"
fi

# 3. tsconfig.json
TSCONFIG="$APP_DIR/tsconfig.json"
if [[ -f "$TSCONFIG" ]]; then
  echo "tsconfig.json already exists, skipping."
else
  cat > "$TSCONFIG" <<'EOF'
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vite/client"]
  },
  "include": ["src"]
}
EOF
  echo "Created tsconfig.json"
fi

# 4. vite.config.ts
VITECONFIG="$APP_DIR/vite.config.ts"
if [[ -f "$VITECONFIG" ]]; then
  echo "vite.config.ts already exists, skipping."
else
  cat > "$VITECONFIG" <<'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4173,
    strictPort: true
  },
  build: {
    outDir: 'dist'
  }
})
EOF
  echo "Created vite.config.ts"
fi

# 5. index.html
INDEX_HTML="$APP_DIR/index.html"
if [[ -f "$INDEX_HTML" ]]; then
  echo "index.html already exists, skipping."
else
  cat > "$INDEX_HTML" <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>RinaWarp Admin Console</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body class="bg-slate-950 text-slate-100">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
  echo "Created index.html"
fi

# 6. src/main.tsx
MAIN_TSX="$APP_DIR/src/main.tsx"
if [[ -f "$MAIN_TSX" ]]; then
  echo "src/main.tsx already exists, skipping."
else
  cat > "$MAIN_TSX" <<'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
EOF
  echo "Created src/main.tsx"
fi

# 7. src/App.tsx
APP_TSX="$APP_DIR/src/App.tsx"
if [[ -f "$APP_TSX" ]]; then
  echo "src/App.tsx already exists, skipping."
else
  cat > "$APP_TSX" <<'EOF'
import React from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { SalesPage } from './pages/SalesPage'
import { LicensesPage } from './pages/LicensesPage'
import { SystemPage } from './pages/SystemPage'

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
            RinaWarp
          </div>
          <h1 className="text-xl font-semibold">Admin Console</h1>
        </div>
        <div className="text-xs text-slate-400">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 mr-1" />
          Production · rinawarptech.com
        </div>
      </header>

      <div className="flex">
        <nav className="w-60 border-r border-slate-800 p-4 space-y-2 text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/sales"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900'
              }`
            }
          >
            Sales & Analytics
          </NavLink>
          <NavLink
            to="/licenses"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900'
              }`
            }
          >
            Licenses
          </NavLink>
          <NavLink
            to="/system"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900'
              }`
            }
          >
            System Status
          </NavLink>

          <div className="mt-4 border-t border-slate-800 pt-4 text-xs text-slate-500 space-y-1">
            <div>Cloudflare Pages · KV-backed</div>
            <div>Stripe · Production keys</div>
          </div>
        </nav>

        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/licenses" element={<LicensesPage />} />
            <Route path="/system" element={<SystemPage />} />
            <Route
              path="*"
              element={
                <div>
                  <h2 className="text-lg font-semibold mb-2">Not found</h2>
                  <p className="text-sm text-slate-400">
                    Go back to <Link className="text-emerald-400" to="/">Dashboard</Link>.
                  </p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}
EOF
  echo "Created src/App.tsx"
fi

# 8. Minimal pages
DASHBOARD_PAGE="$APP_DIR/src/pages/DashboardPage.tsx"
if [[ ! -f "$DASHBOARD_PAGE" ]]; then
  cat > "$DASHBOARD_PAGE" <<'EOF'
import React from 'react'

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Overview</h2>
      <p className="text-sm text-slate-300">
        High-level snapshot of RinaWarp: revenue, active licenses, recent events.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-xl border border-slate-800 p-4">
          <div className="text-slate-400 text-xs uppercase mb-1">Terminal Pro</div>
          <div className="text-2xl font-semibold">—</div>
          <div className="text-slate-500 text-xs mt-1">Lifetime sales (from analytics KV)</div>
        </div>
        <div className="rounded-xl border border-slate-800 p-4">
          <div className="text-slate-400 text-xs uppercase mb-1">AI Music Video</div>
          <div className="text-2xl font-semibold">—</div>
          <div className="text-slate-500 text-xs mt-1">Lifetime sales (from analytics KV)</div>
        </div>
        <div className="rounded-xl border border-slate-800 p-4">
          <div className="text-slate-400 text-xs uppercase mb-1">Active Licenses</div>
          <div className="text-2xl font-semibold">—</div>
          <div className="text-slate-500 text-xs mt-1">From license-verify worker</div>
        </div>
      </div>
    </div>
  )
}
EOF
  echo "Created DashboardPage"
fi

SALES_PAGE="$APP_DIR/src/pages/SalesPage.tsx"
if [[ ! -f "$SALES_PAGE" ]]; then
  cat > "$SALES_PAGE" <<'EOF'
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
EOF
  echo "Created SalesPage"
fi

LICENSES_PAGE="$APP_DIR/src/pages/LicensesPage.tsx"
if [[ ! -f "$LICENSES_PAGE" ]]; then
  cat > "$LICENSES_PAGE" <<'EOF'
import React from 'react'

export const LicensesPage: React.FC = () => {
  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-lg font-semibold">Licenses</h2>
      <p className="text-slate-300">
        This page will integrate with your Cloudflare Worker <code>license-verify</code> to show
        license lookups, status, and limits.
      </p>
      <ul className="list-disc list-inside text-slate-400">
        <li>Search license keys</li>
        <li>View activation history</li>
        <li>Mark keys as revoked / compromised (future)</li>
      </ul>
      <p className="text-xs text-slate-500">
        Backend is already live; this UI is a safe, read-only starting point.
      </p>
    </div>
  )
}
EOF
  echo "Created LicensesPage"
fi

SYSTEM_PAGE="$APP_DIR/src/pages/SystemPage.tsx"
if [[ ! -f "$SYSTEM_PAGE" ]]; then
  cat > "$SYSTEM_PAGE" <<'EOF'
import React, { useEffect, useState } from 'react'

type Health = {
  analytics?: 'ok' | 'error'
  checkout?: 'ok' | 'error'
}

const API_BASE = 'https://rinawarptech.com'

export const SystemPage: React.FC = () => {
  const [health, setHealth] = useState<Health>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const h: Health = {}
      try {
        const res = await fetch(`${API_BASE}/api/analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ping' })
        })
        h.analytics = res.ok ? 'ok' : 'error'
      } catch {
        h.analytics = 'error'
      }

      try {
        const res = await fetch(`${API_BASE}/api/checkout`, { method: 'GET' })
        h.checkout = res.ok || res.status === 405 ? 'ok' : 'error'
      } catch {
        h.checkout = 'error'
      }

      setHealth(h)
      setLoading(false)
    }

    void run()
  }, [])

  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-lg font-semibold">System Status</h2>
      <p className="text-slate-300">
        Lightweight health checks against Cloudflare Functions in production.
      </p>

      <div className="space-y-2 max-w-md">
        <StatusRow label="Analytics (KV)" status={health.analytics} loading={loading} />
        <StatusRow label="Checkout (Stripe)" status={health.checkout} loading={loading} />
      </div>

      <p className="text-xs text-slate-500">
        This page should never expose secrets; it only checks HTTP reachability and basic behavior.
      </p>
    </div>
  )
}

const StatusRow: React.FC<{ label: string; status?: 'ok' | 'error'; loading: boolean }> = ({
  label,
  status,
  loading
}) => {
  let dotClass = 'bg-slate-600'
  let text = 'Unknown'

  if (loading) {
    text = 'Checking…'
  } else if (status === 'ok') {
    dotClass = 'bg-emerald-400'
    text = 'OK'
  } else if (status === 'error') {
    dotClass = 'bg-rose-500'
    text = 'Error'
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900 px-3 py-2">
      <span>{label}</span>
      <span className="flex items-center gap-2 text-xs text-slate-300">
        <span className={`inline-flex h-2 w-2 rounded-full ${dotClass}`} />
        {text}
      </span>
    </div>
  )
}
EOF
  echo "Created SystemPage"
fi

echo
echo "✅ Admin console scaffold created."
echo "Next steps:"
echo "  cd \"$APP_DIR\""
echo "  npm install"
echo "  npm run dev"
