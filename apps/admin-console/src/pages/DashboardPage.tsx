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
