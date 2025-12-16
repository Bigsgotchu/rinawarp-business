import React, { useEffect, useState } from 'react';
import { useAdmin } from '../lib/adminContext';
import { getAnalyticsSummary, getRecentSales, AnalyticsSummary, RecentSale } from '../lib/api';

export const Dashboard: React.FC = () => {
  const { apiToken } = useAdmin();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recent, setRecent] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiToken) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, recentData] = await Promise.all([
          getAnalyticsSummary(apiToken),
          getRecentSales(apiToken),
        ]);
        setSummary(summaryData);
        setRecent(recentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [apiToken]);

  // Load Stripe prices
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const r = await fetch('/api/stripe/prices?_=' + Date.now(), { cache: 'no-store' });
        if (!r.ok) throw new Error('http ' + r.status);
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'prices not ok');

        const data = j.data || [];
        const byInterval = (intv: string) =>
          data.find((p: any) => p.recurring?.interval === intv) || null;
        const byLookup = (key: string) =>
          data.find((p: any) => (p.lookup_key || '').toLowerCase() === key) || null;

        const monthly = byLookup('rw_pro_monthly') || byInterval('month');
        const annual = byLookup('rw_pro_annual') || byInterval('year');

        const mAmount = document.getElementById('price-monthly-amount');
        const mCurr = document.getElementById('price-monthly-currency');
        const aAmount = document.getElementById('price-annual-amount');
        const aCurr = document.getElementById('price-annual-currency');
        const oStatus = document.getElementById('price-overall-status');

        const okM = !!monthly && monthly.active !== false;
        const okA = !!annual && annual.active !== false;

        if (mAmount) mAmount.textContent = okM ? `$${(monthly.unit_amount / 100).toFixed(2)}` : '—';
        if (mCurr) mCurr.textContent = okM ? (monthly.currency || '').toUpperCase() : '—';
        if (aAmount) aAmount.textContent = okA ? `$${(annual.unit_amount / 100).toFixed(2)}` : '—';
        if (aCurr) aCurr.textContent = okA ? (annual.currency || '').toUpperCase() : '—';

        const overallOK = okM && okA;
        if (oStatus) oStatus.textContent = overallOK ? 'OK' : okM || okA ? 'PARTIAL' : 'ERROR';
      } catch (e) {
        const oStatus = document.getElementById('price-overall-status');
        if (oStatus) oStatus.textContent = 'ERROR';
      }
    };
    loadPrices();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="text-sm text-neutral-400 mb-1">Total Revenue</div>
          <div className="text-2xl font-semibold">
            {summary ? `$${(summary.totalRevenue / 100).toFixed(2)}` : '--'}
          </div>
          <div className="text-xs text-neutral-500 mt-1">All-time gross revenue</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="text-sm text-neutral-400 mb-1">Total Sales</div>
          <div className="text-2xl font-semibold">
            {summary ? summary.totalSales.toString() : '--'}
          </div>
          <div className="text-xs text-neutral-500 mt-1">All-time successful checkouts</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="text-sm text-neutral-400 mb-1">Tracked Products</div>
          <div className="text-2xl font-semibold">
            {summary ? summary.products.length.toString() : '--'}
          </div>
          <div className="text-xs text-neutral-500 mt-1">Distinct SKUs in analytics</div>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
          Error loading dashboard: {error}
        </div>
      )}

      {!apiToken && (
        <div className="mb-4 text-sm text-amber-300 bg-amber-900/30 border border-amber-700 rounded-lg px-3 py-2">
          Set your admin API token in <strong>Settings</strong> to load live data.
        </div>
      )}

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Stripe Prices Self-Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm">
            <div className="text-xs text-neutral-400 mb-1">Monthly</div>
            <div className="text-lg font-medium" id="price-monthly-amount">
              —
            </div>
            <div className="text-xs text-neutral-500" id="price-monthly-currency">
              —
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm">
            <div className="text-xs text-neutral-400 mb-1">Annual</div>
            <div className="text-lg font-medium" id="price-annual-amount">
              —
            </div>
            <div className="text-xs text-neutral-500" id="price-annual-currency">
              —
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm">
            <div className="text-xs text-neutral-400 mb-1">Overall Status</div>
            <div className="text-lg font-medium" id="price-overall-status">
              —
            </div>
            <div className="text-xs text-neutral-500">/api/stripe/prices</div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Product Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {summary?.products.map((p) => (
            <div
              key={p.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm"
            >
              <div className="font-medium">{p.name}</div>
              <div className="mt-1 text-neutral-400 text-xs">{p.id}</div>
              <div className="mt-2 flex justify-between text-xs">
                <span>Revenue</span>
                <span>${(p.revenue / 100).toFixed(2)}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs">
                <span>Sales</span>
                <span>{p.sales}</span>
              </div>
            </div>
          ))}
          {!summary && <div className="text-sm text-neutral-500">No data yet.</div>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Recent Sales</h2>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-950/70">
              <tr className="text-xs text-neutral-400">
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((s) => (
                <tr key={s.id} className="border-t border-neutral-800/70">
                  <td className="px-3 py-2 text-xs text-neutral-400">
                    {new Date(s.timestamp).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{s.email || 'N/A'}</td>
                  <td className="px-3 py-2 text-xs">
                    <div>{s.productName}</div>
                    <div className="text-neutral-500">{s.productId}</div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    ${(s.amount / 100).toFixed(2)} {s.currency.toUpperCase()}
                  </td>
                </tr>
              ))}
              {!recent.length && (
                <tr>
                  <td className="px-3 py-3 text-sm text-neutral-500" colSpan={4}>
                    No recent sales yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {loading && <div className="mt-3 text-xs text-neutral-500">Loading latest metrics…</div>}
    </div>
  );
};
