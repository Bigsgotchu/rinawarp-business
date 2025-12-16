import React, { useEffect, useState } from 'react';
import { useAdmin } from '../lib/adminContext';
import { getCustomers, Customer } from '../lib/api';

export const Customers: React.FC = () => {
  const { apiToken } = useAdmin();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiToken) return;

    const loadCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCustomers(apiToken);
        setCustomers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [apiToken]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Stripe Customers</h2>
      {error && (
        <div className="mb-3 text-sm text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-950/70 text-xs text-neutral-400">
            <tr>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Products</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-neutral-800/70 text-xs">
                <td className="px-3 py-2">
                  <div>{c.email}</div>
                  <div className="text-neutral-500">{c.name || 'No name'}</div>
                  <div className="text-neutral-500 font-mono text-[11px]">{c.id}</div>
                </td>
                <td className="px-3 py-2">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2">{c.subscriptionStatus || 'N/A'}</td>
                <td className="px-3 py-2">{c.products?.length ? c.products.join(', ') : '—'}</td>
              </tr>
            ))}
            {!customers.length && (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-neutral-500 text-sm">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <div className="mt-3 text-xs text-neutral-500">Loading customers…</div>}
    </div>
  );
};
