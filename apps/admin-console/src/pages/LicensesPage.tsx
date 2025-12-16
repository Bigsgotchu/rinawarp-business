import React, { useEffect, useState } from 'react';
import { listLicenses, createLicense, extendLicense, revokeLicense, License } from '../lib/api';
import { useAdmin } from '../lib/adminContext';

const inputBase =
  'w-full rounded-md bg-slate-900/50 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500';

export default function LicensesPage() {
  const { apiToken: adminToken } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<License | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create license form
  const [newEmail, setNewEmail] = useState('');
  const [newProduct, setNewProduct] = useState('terminal');
  const [newPlan, setNewPlan] = useState('pro_monthly');
  const [newSeats, setNewSeats] = useState<number>(1);

  // Extend license form
  const [extendDate, setExtendDate] = useState('');
  const [extendNotes, setExtendNotes] = useState('');

  // Revoke license form
  const [revokeReason, setRevokeReason] = useState('support_action');
  const [revokeNotes, setRevokeNotes] = useState('');

  useEffect(() => {
    void reload();
  }, []);

  async function reload() {
    if (!adminToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listLicenses(adminToken, { q: query, limit: 50 });
      setLicenses(data);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLicense(e: React.FormEvent) {
    e.preventDefault();
    if (!adminToken) {
      setError('Admin token required');
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      const lic = await createLicense(adminToken, {
        email: newEmail.trim(),
        product: newProduct,
        plan: newPlan,
        seats: newSeats,
      });
      setSuccess(`License created: ${lic.licenseKey}`);
      setNewEmail('');
      await reload();
    } catch (err: any) {
      setError(err.message ?? String(err));
    }
  }

  async function handleExtendLicense(e: React.FormEvent) {
    e.preventDefault();
    if (!adminToken || !selected) return;
    setError(null);
    setSuccess(null);
    try {
      await extendLicense(adminToken, {
        licenseKey: selected.licenseKey,
        expiresAt: extendDate ? new Date(extendDate).toISOString() : undefined,
        notes: extendNotes || undefined,
      });
      setSuccess('License extended');
      setExtendDate('');
      setExtendNotes('');
      await reload();
    } catch (err: any) {
      setError(err.message ?? String(err));
    }
  }

  async function handleRevokeLicense(e: React.FormEvent) {
    e.preventDefault();
    if (!adminToken || !selected) return;
    setError(null);
    setSuccess(null);
    try {
      await revokeLicense(adminToken, selected.licenseKey, revokeReason, revokeNotes || undefined);
      setSuccess('License revoked');
      setRevokeNotes('');
      await reload();
    } catch (err: any) {
      setError(err.message ?? String(err));
    }
  }

  return (
    <div className="flex h-full gap-6">
      {/* LEFT: List */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <input
            className={inputBase}
            placeholder="Search by email, license key, or product..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={() => reload()}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-emerald-400"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/40 px-4 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/40 px-4 py-2 text-sm text-emerald-200">
            {success}
          </div>
        )}

        <div className="flex-1 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/60 sticky top-0">
              <tr className="text-left text-slate-300">
                <th className="px-3 py-2">License</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Expires</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((lic) => (
                <tr
                  key={lic.licenseKey}
                  className={`cursor-pointer border-t border-slate-800/60 hover:bg-slate-900/40 ${
                    selected?.licenseKey === lic.licenseKey ? 'bg-slate-900/70' : ''
                  }`}
                  onClick={() => setSelected(lic)}
                >
                  <td className="px-3 py-2 font-mono text-xs text-emerald-300">{lic.licenseKey}</td>
                  <td className="px-3 py-2 text-slate-200">{lic.email}</td>
                  <td className="px-3 py-2 text-slate-200">{lic.product}</td>
                  <td className="px-3 py-2 text-slate-400">{lic.plan}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        lic.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40'
                          : lic.status === 'revoked'
                            ? 'bg-red-500/10 text-red-300 border border-red-500/40'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {lic.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-400">
                    {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {licenses.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No licenses found. Try adjusting your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="w-96 flex flex-col gap-4">
        {/* Create */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100 mb-3">Create License</h2>
          <form className="space-y-2" onSubmit={handleCreateLicense}>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Customer Email</label>
              <input
                className={inputBase}
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Product</label>
              <select
                className={inputBase}
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
              >
                <option value="terminal">Terminal Pro</option>
                <option value="amvc">AI Music Video Creator</option>
                <option value="bundle">Bundle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Plan ID</label>
              <input
                className={inputBase}
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Seats</label>
              <input
                className={inputBase}
                type="number"
                min={1}
                value={newSeats}
                onChange={(e) => setNewSeats(Number(e.target.value) || 1)}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-emerald-400"
            >
              Create License
            </button>
          </form>
        </div>

        {/* Extend */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100 mb-2">Extend License</h2>
          {!selected ? (
            <p className="text-xs text-slate-500">Select a license from the list to extend.</p>
          ) : (
            <form className="space-y-2" onSubmit={handleExtendLicense}>
              <p className="text-xs text-slate-400 mb-1">
                License: <span className="font-mono text-emerald-300">{selected.licenseKey}</span>
              </p>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  New Expiry Date (optional)
                </label>
                <input
                  className={inputBase}
                  type="date"
                  value={extendDate}
                  onChange={(e) => setExtendDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Notes (optional)</label>
                <textarea
                  className={inputBase}
                  rows={2}
                  value={extendNotes}
                  onChange={(e) => setExtendNotes(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-sky-400"
              >
                Apply Extension
              </button>
            </form>
          )}
        </div>

        {/* Revoke */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100 mb-2">Revoke License</h2>
          {!selected ? (
            <p className="text-xs text-slate-500">Select a license from the list to revoke.</p>
          ) : (
            <form className="space-y-2" onSubmit={handleRevokeLicense}>
              <p className="text-xs text-slate-400 mb-1">
                License: <span className="font-mono text-emerald-300">{selected.licenseKey}</span>
              </p>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Reason</label>
                <select
                  className={inputBase}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                >
                  <option value="support_action">Support action</option>
                  <option value="refund">Refund</option>
                  <option value="fraud">Fraud</option>
                  <option value="abuse">Abuse</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Notes (optional)</label>
                <textarea
                  className={inputBase}
                  rows={2}
                  value={revokeNotes}
                  onChange={(e) => setRevokeNotes(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-red-400"
              >
                Revoke License
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
