import React, { useEffect, useState } from 'react';
import { useAdmin } from '../lib/adminContext';
import { listLicenses, License } from '../lib/api';

export const Licenses: React.FC = () => {
  const { apiToken } = useAdmin();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (q?: string) => {
    if (!apiToken) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listLicenses(apiToken, q ? { q } : {});
      setLicenses(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load licenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [apiToken]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Licenses</h2>
        <div className="flex gap-2">
          <input
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-emerald-500"
            placeholder="Search by email or key…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(query)}
          />
          <button
            onClick={() => load(query)}
            className="text-sm px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500"
          >
            Search
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-950/70 text-xs text-neutral-400">
            <tr>
              <th className="px-3 py-2 text-left">Key</th>
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Seats</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-left">Expires</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((lic) => (
              <tr key={lic.licenseKey} className="border-t border-neutral-800/70 text-xs">
                <td className="px-3 py-2 font-mono text-[11px]">{lic.licenseKey}</td>
                <td className="px-3 py-2">{lic.product}</td>
                <td className="px-3 py-2">{lic.email || 'N/A'}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      'inline-flex px-2 py-0.5 rounded-full border ' +
                      (lic.status === 'active'
                        ? 'border-emerald-500 text-emerald-400'
                        : lic.status === 'expired'
                          ? 'border-yellow-500 text-yellow-400'
                          : 'border-red-500 text-red-400')
                    }
                  >
                    {lic.status}
                  </span>
                </td>
                <td className="px-3 py-2">{lic.seats}</td>
                <td className="px-3 py-2">{new Date(lic.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2">
                  {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {!licenses.length && (
              <tr>
                <td colSpan={7} className="px-3 py-3 text-neutral-500 text-sm">
                  No licenses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <div className="mt-3 text-xs text-neutral-500">Loading licenses…</div>}
    </div>
  );
};
