import React, { useEffect, useState } from 'react';
import { useAdmin } from '../lib/adminContext';

type BillingSummary = {
  summary: {
    recentRevenueCents: number;
    recentPurchasesCount: number;
    activeSubscriptions: number;
  };
  purchases: BillingPurchase[];
  listComplete: boolean;
};

type BillingPurchase = {
  id: string;
  stripeCustomerId: string;
  email: string | null;
  amountTotalCents: number;
  currency: string;
  productType: string;
  productId: string | null;
  priceId: string | null;
  quantity: number;
  kind: string;
  createdAt: string;
};

type BillingCustomerDetail = {
  customerId: string;
  customer: any;
  purchases: BillingPurchase[];
  subscriptions: any[];
  credits: any;
};

const formatCurrency = (cents: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(cents / 100);
};

export const Billing: React.FC = () => {
  const { apiToken } = useAdmin();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [lookupEmail, setLookupEmail] = useState('');
  const [customerDetail, setCustomerDetail] =
    useState<BillingCustomerDetail | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasToken = !!apiToken;

  useEffect(() => {
    if (!hasToken) return;
    void fetchSummary();
  }, [hasToken]);

  async function fetchSummary() {
    setLoadingSummary(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/billing-summary', {
        headers: {
          'x-admin-secret': apiToken!
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to load (${res.status})`);
      }
      const json = (await res.json()) as BillingSummary;
      setSummary(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load billing summary');
    } finally {
      setLoadingSummary(false);
    }
  }

  async function fetchCustomerByEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!lookupEmail.trim() || !apiToken) return;

    setLoadingCustomer(true);
    setCustomerDetail(null);
    setError(null);

    try {
      const url = new URL(
        '/api/admin/billing-customer',
        window.location.origin
      );
      url.searchParams.set('email', lookupEmail.trim());

      const res = await fetch(url.toString(), {
        headers: {
          'x-admin-secret': apiToken
        }
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('No customer found for that email');
        }
        throw new Error(`Failed to load customer (${res.status})`);
      }

      const json = (await res.json()) as BillingCustomerDetail;
      setCustomerDetail(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load customer');
    } finally {
      setLoadingCustomer(false);
    }
  }

  if (!hasToken) {
    return (
      <div className="p-6 text-sm text-neutral-300">
        <h1 className="text-xl font-semibold mb-2">
          Billing Overview
        </h1>
        <p>
          Set your admin API token in the <strong>Settings</strong> page
          to access billing data.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-neutral-100">
      <div>
        <h1 className="text-2xl font-semibold mb-1">
          Billing Overview
        </h1>
        <p className="text-sm text-neutral-400">
          Unified view of purchases, subscriptions, and credits from
          Stripe + KV.
        </p>
      </div>

      {error && (
        <div className="border border-red-500/40 bg-red-500/10 text-red-200 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-4">
          <div className="text-xs text-neutral-400">
            Recent Revenue
          </div>
          <div className="text-xl font-semibold mt-1">
            {summary
              ? formatCurrency(
                  summary.summary.recentRevenueCents,
                  'usd'
                )
              : '—'}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-4">
          <div className="text-xs text-neutral-400">
            Recent Purchases
          </div>
          <div className="text-xl font-semibold mt-1">
            {summary?.summary.recentPurchasesCount ?? '—'}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-4">
          <div className="text-xs text-neutral-400">
            Active Subscriptions
          </div>
          <div className="text-xl font-semibold mt-1">
            {summary?.summary.activeSubscriptions ?? '—'}
          </div>
        </div>
      </div>

      {/* Customer lookup */}
      <div className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-medium">
              Look up customer by email
            </div>
            <div className="text-xs text-neutral-400">
              See full purchase history, subscriptions, and credits.
            </div>
          </div>
        </div>

        <form
          onSubmit={fetchCustomerByEmail}
          className="flex flex-col sm:flex-row gap-2 mt-2"
        >
          <input
            type="email"
            className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60"
            placeholder="user@example.com"
            value={lookupEmail}
            onChange={(e) => setLookupEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={loadingCustomer}
            className="rounded-lg bg-sky-500/90 hover:bg-sky-400 text-sm font-medium px-4 py-2 disabled:opacity-60"
          >
            {loadingCustomer ? 'Loading…' : 'Load Customer'}
          </button>
        </form>

        {customerDetail && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-sm font-semibold">
                {customerDetail.customer?.email ||
                  customerDetail.customerId}
              </div>
              <div className="text-xs text-neutral-400">
                Stripe Customer ID:{' '}
                {customerDetail.customerId || '—'}
              </div>
              {customerDetail.customer && (
                <div className="mt-1 text-xs text-neutral-400">
                  LTV:{' '}
                  {formatCurrency(
                    customerDetail.customer.ltvCents || 0,
                    'usd'
                  )}
                  {' · '}Last seen:{' '}
                  {customerDetail.customer.lastSeenAt || '—'}
                </div>
              )}
            </div>

            {/* Purchases */}
            <div>
              <div className="text-sm font-medium mb-1">
                Purchases ({customerDetail.purchases.length})
              </div>
              <div className="rounded-lg border border-neutral-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-neutral-900/80 text-neutral-400">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Product</th>
                      <th className="px-3 py-2 text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerDetail.purchases.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t border-neutral-800/70"
                      >
                        <td className="px-3 py-2">
                          {new Date(
                            p.createdAt
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2">{p.kind}</td>
                        <td className="px-3 py-2">
                          {p.productType}{' '}
                          {p.productId ? `· ${p.productId}` : ''}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(
                            p.amountTotalCents,
                            p.currency || 'usd'
                          )}
                        </td>
                      </tr>
                    ))}
                    {customerDetail.purchases.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-3 text-center text-neutral-500"
                        >
                          No purchases found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subscriptions */}
            <div>
              <div className="text-sm font-medium mb-1">
                Subscriptions ({customerDetail.subscriptions.length})
              </div>
              <div className="rounded-lg border border-neutral-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-neutral-900/80 text-neutral-400">
                    <tr>
                      <th className="px-3 py-2 text-left">ID</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">
                        Product
                      </th>
                      <th className="px-3 py-2 text-left">
                        Current Period End
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerDetail.subscriptions.map((s) => (
                      <tr
                        key={s.id}
                        className="border-t border-neutral-800/70"
                      >
                        <td className="px-3 py-2">{s.id}</td>
                        <td className="px-3 py-2">{s.status}</td>
                        <td className="px-3 py-2">
                          {s.productId || '—'}
                        </td>
                        <td className="px-3 py-2">
                          {s.currentPeriodEnd
                            ? new Date(
                                s.currentPeriodEnd * 1000
                              ).toLocaleDateString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                    {customerDetail.subscriptions.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-3 text-center text-neutral-500"
                        >
                          No subscriptions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Credits */}
            <div>
              <div className="text-sm font-medium mb-1">
                Credits
              </div>
              {customerDetail.credits ? (
                <div className="text-xs text-neutral-300">
                  Remaining:{' '}
                  <span className="font-semibold">
                    {customerDetail.credits.remaining}
                  </span>{' '}
                  · Last updated:{' '}
                  {customerDetail.credits.lastUpdated || '—'}
                </div>
              ) : (
                <div className="text-xs text-neutral-500">
                  No credits record found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recent purchases table */}
      <div className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-sm font-medium">
              Recent purchases
            </div>
            <div className="text-xs text-neutral-400">
              Latest purchase events ingested from Stripe webhooks.
            </div>
          </div>
          <button
            onClick={fetchSummary}
            disabled={loadingSummary}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs hover:bg-neutral-800 disabled:opacity-60"
          >
            {loadingSummary ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="w-full text-xs">
            <thead className="bg-neutral-900/80 text-neutral-400">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {summary?.purchases?.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-neutral-800/70"
                >
                  <td className="px-3 py-2">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    {p.email || '—'}
                  </td>
                  <td className="px-3 py-2">{p.kind}</td>
                  <td className="px-3 py-2">
                    {p.productType}{' '}
                    {p.productId ? `· ${p.productId}` : ''}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatCurrency(
                      p.amountTotalCents,
                      p.currency || 'usd'
                    )}
                  </td>
                </tr>
              ))}
              {!summary?.purchases?.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-3 text-center text-neutral-500"
                  >
                    No purchase data yet. Once Stripe starts sending
                    webhooks, events will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};