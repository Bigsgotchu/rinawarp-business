import React, { useEffect, useState } from 'react';

type Health = {
  analytics?: 'ok' | 'error';
  checkout?: 'ok' | 'error';
};

const API_BASE = 'https://rinawarptech.com';

export const SystemPage: React.FC = () => {
  const [health, setHealth] = useState<Health>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const h: Health = {};
      try {
        const res = await fetch(`${API_BASE}/api/analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ping' }),
        });
        h.analytics = res.ok ? 'ok' : 'error';
      } catch {
        h.analytics = 'error';
      }

      try {
        const res = await fetch(`${API_BASE}/api/checkout`, { method: 'GET' });
        h.checkout = res.ok || res.status === 405 ? 'ok' : 'error';
      } catch {
        h.checkout = 'error';
      }

      setHealth(h);
      setLoading(false);
    };

    void run();
  }, []);

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
  );
};

const StatusRow: React.FC<{ label: string; status?: 'ok' | 'error'; loading: boolean }> = ({
  label,
  status,
  loading,
}) => {
  let dotClass = 'bg-slate-600';
  let text = 'Unknown';

  if (loading) {
    text = 'Checking…';
  } else if (status === 'ok') {
    dotClass = 'bg-emerald-400';
    text = 'OK';
  } else if (status === 'error') {
    dotClass = 'bg-rose-500';
    text = 'Error';
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900 px-3 py-2">
      <span>{label}</span>
      <span className="flex items-center gap-2 text-xs text-slate-300">
        <span className={`inline-flex h-2 w-2 rounded-full ${dotClass}`} />
        {text}
      </span>
    </div>
  );
};
