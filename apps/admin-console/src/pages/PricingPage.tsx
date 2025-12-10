import React, { useEffect, useState } from 'react';
import {
  getPricingConfig,
  updatePricingConfig,
  PricingConfig,
  PriceEntry,
} from '../lib/api';
import { useAdmin } from '../lib/adminContext';

const inputBase =
  'w-full rounded-md bg-slate-900/50 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500';

const badge =
  'inline-flex items-center rounded-full border border-slate-700 bg-slate-900/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400';

type ProductKind = 'terminal' | 'amvc' | 'bundles';

export default function PricingPage() {
  const { apiToken: adminToken } = useAdmin();
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState('founder');

  useEffect(() => {
    void reload();
  }, []);

  async function reload() {
    if (!adminToken) return;
    setLoading(true);
    setError(null);
    try {
      const cfg = await getPricingConfig(adminToken);
      setConfig(cfg);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  function updateEntry(
    kind: ProductKind,
    index: number,
    patch: Partial<PriceEntry>,
  ) {
    if (!config) return;
    const clone: PricingConfig = JSON.parse(JSON.stringify(config));
    const arr =
      kind === 'terminal'
        ? clone.products.terminal
        : kind === 'amvc'
        ? clone.products.amvc
        : clone.products.bundles;
    arr[index] = { ...arr[index], ...patch };
    setConfig(clone);
  }

  function addEntry(kind: ProductKind) {
    if (!config) return;
    const clone: PricingConfig = JSON.parse(JSON.stringify(config));
    const arr =
      kind === 'terminal'
        ? clone.products.terminal
        : kind === 'amvc'
        ? clone.products.amvc
        : clone.products.bundles;

    arr.push({
      id: `new_${Date.now()}`,
      stripePriceId: '',
      name: 'New plan',
      description: '',
      type: 'subscription',
      amount: 0,
      currency: 'usd',
      active: true,
    });
    setConfig(clone);
  }

  function removeEntry(kind: ProductKind, index: number) {
    if (!config) return;
    const clone: PricingConfig = JSON.parse(JSON.stringify(config));
    const arr =
      kind === 'terminal'
        ? clone.products.terminal
        : kind === 'amvc'
        ? clone.products.amvc
        : clone.products.bundles;
    arr.splice(index, 1);
    setConfig(clone);
  }

  async function handleSave() {
    if (!adminToken || !config) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const newCfg = await updatePricingConfig(
        adminToken,
        config,
        updatedBy || 'admin',
      );
      setConfig(newCfg);
      setSuccess('Pricing updated and stored in KV.');
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setSaving(false);
    }
  }

  const sections: { label: string; key: ProductKind; description: string }[] = [
    {
      label: 'Terminal Pro',
      key: 'terminal',
      description: 'Desktop terminal and device control plans.',
    },
    {
      label: 'AI Music Video Creator',
      key: 'amvc',
      description: 'AI-powered music video and media plans.',
    },
    {
      label: 'Bundles',
      key: 'bundles',
      description: 'Combined terminal + AI bundles and promotions.',
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">
            Pricing Configuration
          </h1>
          <p className="text-xs text-slate-400">
            Edit live pricing, Stripe price IDs, and product metadata. Changes
            are persisted to Cloudflare KV.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={badge}>
              Version:{' '}
              <span className="ml-1 text-emerald-300">
                {config?.version ?? '–'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Last updated:{' '}
              {config?.updatedAt
                ? new Date(config.updatedAt).toLocaleString()
                : '—'}
            </p>
          </div>
          <div>
            <input
              className={inputBase + ' w-40'}
              placeholder="Updated by"
              value={updatedBy}
              onChange={(e) => setUpdatedBy(e.target.value)}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={!config || saving}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Publish Pricing'}
          </button>
        </div>
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

      {loading && (
        <div className="text-sm text-slate-400">Loading pricing…</div>
      )}

      {!loading && !config && (
        <div className="text-sm text-slate-400">
          No pricing configuration loaded.
        </div>
      )}

      {config && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 overflow-auto">
          {sections.map((section) => {
            const entries =
              section.key === 'terminal'
                ? config.products.terminal
                : section.key === 'amvc'
                ? config.products.amvc
                : config.products.bundles;

            return (
              <div
                key={section.key}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                      {section.label}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {section.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addEntry(section.key)}
                    className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] text-slate-100 hover:bg-slate-700"
                  >
                    + Add Plan
                  </button>
                </div>

                <div className="space-y-3 overflow-auto pr-1">
                  {entries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          className={inputBase + ' text-xs'}
                          value={entry.name}
                          onChange={(e) =>
                            updateEntry(section.key, idx, {
                              name: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeEntry(section.key, idx)}
                          className="text-[11px] text-red-300 hover:text-red-200"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">
                            Plan ID
                          </label>
                          <input
                            className={inputBase + ' text-xs'}
                            value={entry.id}
                            onChange={(e) =>
                              updateEntry(section.key, idx, {
                                id: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">
                            Stripe Price ID
                          </label>
                          <input
                            className={inputBase + ' text-xs'}
                            value={entry.stripePriceId}
                            onChange={(e) =>
                              updateEntry(section.key, idx, {
                                stripePriceId: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">
                            Type
                          </label>
                          <select
                            className={inputBase + ' text-xs'}
                            value={entry.type}
                            onChange={(e) =>
                              updateEntry(section.key, idx, {
                                type: e.target
                                  .value as PriceEntry['type'],
                              })
                            }
                          >
                            <option value="subscription">Subscription</option>
                            <option value="one_time">One-time</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">
                            Amount (USD)
                          </label>
                          <input
                            className={inputBase + ' text-xs'}
                            type="number"
                            min={0}
                            value={entry.amount / 100}
                            onChange={(e) =>
                              updateEntry(section.key, idx, {
                                amount: Math.round(
                                  Number(e.target.value || 0) * 100,
                                ),
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">
                            Active
                          </label>
                          <select
                            className={inputBase + ' text-xs'}
                            value={entry.active ? '1' : '0'}
                            onChange={(e) =>
                              updateEntry(section.key, idx, {
                                active: e.target.value === '1',
                              })
                            }
                          >
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">
                          Description
                        </label>
                        <textarea
                          className={inputBase + ' text-xs'}
                          rows={2}
                          value={entry.description ?? ''}
                          onChange={(e) =>
                            updateEntry(section.key, idx, {
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}

                  {entries.length === 0 && (
                    <p className="text-[11px] text-slate-500">
                      No plans yet. Click "Add Plan" to create one.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}