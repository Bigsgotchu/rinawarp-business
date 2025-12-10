import React, { useEffect, useState } from "react";
import { useAdmin } from "../lib/adminContext";
import { createApiClient, AnalyticsSummary, RecentSale } from "../lib/api";
import { StatCard } from "../components/StatCard";

export const Dashboard: React.FC = () => {
  const { apiToken } = useAdmin();
  const api = createApiClient(apiToken);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recent, setRecent] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiToken) return;
    setLoading(true);
    setError(null);
    Promise.all([api.getSummary(), api.getRecentSales()])
      .then(([s, r]) => {
        setSummary(s);
        setRecent(r);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiToken]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Revenue"
          value={summary ? `$${(summary.totalRevenue / 100).toFixed(2)}` : "--"}
          hint="All-time gross revenue"
        />
        <StatCard
          label="Total Sales"
          value={summary ? summary.totalSales.toString() : "--"}
          hint="All-time successful checkouts"
        />
        <StatCard
          label="Tracked Products"
          value={summary ? summary.products.length.toString() : "--"}
          hint="Distinct SKUs in analytics"
        />
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
                  <td className="px-3 py-2">{s.email || "N/A"}</td>
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

      {loading && (
        <div className="mt-3 text-xs text-neutral-500">Loading latest metrics…</div>
      )}
    </div>
  );
};