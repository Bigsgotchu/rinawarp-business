const API_BASE = 'https://master.rinawarptech.pages.dev'; // Cloudflare Pages URL for admin API

export interface AdminState {
  adminToken: string | null;
}

export interface License {
  licenseKey: string;
  email: string;
  product: string;
  plan: string;
  seats?: number;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  expiresAt?: string;
  notes?: string;
}

export interface PriceEntry {
  id: string;
  stripePriceId: string;
  name: string;
  description?: string;
  type: 'subscription' | 'one_time';
  amount: number;
  currency: 'usd' | 'eur';
  active: boolean;
  maxSeats?: number;
  notes?: string;
}

export interface PricingConfig {
  version: number;
  updatedAt: string;
  updatedBy: string;
  products: {
    terminal: PriceEntry[];
    amvc: PriceEntry[];
    bundles: PriceEntry[];
  };
}

async function adminFetch<T = any>(
  path: string,
  method: string,
  adminToken: string | null,
  body?: any,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (adminToken) {
    headers['x-admin-secret'] = adminToken;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `API error ${res.status} on ${path}: ${text.slice(0, 300)}`,
    );
  }

  return (await res.json()) as T;
}

/* ------- LICENSES ------- */

export async function listLicenses(
  adminToken: string | null,
  opts: { q?: string; email?: string; licenseKey?: string; limit?: number },
): Promise<License[]> {
  const params = new URLSearchParams();
  if (opts.q) params.set('q', opts.q);
  if (opts.email) params.set('email', opts.email);
  if (opts.licenseKey) params.set('licenseKey', opts.licenseKey);
  if (opts.limit) params.set('limit', String(opts.limit));

  const data = await adminFetch<{ data: License[] }>(
    `/api/admin/licenses?${params.toString()}`,
    'GET',
    adminToken,
  );
  return data.data ?? [];
}

export async function createLicense(
  adminToken: string | null,
  payload: {
    email: string;
    product: string;
    plan: string;
    seats?: number;
    expiresAt?: string;
    notes?: string;
  },
): Promise<License> {
  const data = await adminFetch<{ data: License }>(
    '/api/admin/licenses',
    'POST',
    adminToken,
    payload,
  );
  return data.data;
}

export async function extendLicense(
  adminToken: string | null,
  payload: {
    licenseKey: string;
    expiresAt?: string;
    notes?: string;
  },
): Promise<License> {
  const data = await adminFetch<{ data: License }>(
    '/api/admin/licenses',
    'PATCH',
    adminToken,
    payload,
  );
  return data.data;
}

export async function revokeLicense(
  adminToken: string | null,
  licenseKey: string,
  reason?: string,
  notes?: string,
): Promise<void> {
  await adminFetch(
    '/api/admin/licenses',
    'DELETE',
    adminToken,
    { licenseKey, reason, notes },
  );
}

/* ------- PRICING ------- */

export async function getPricingConfig(
  adminToken: string | null,
): Promise<PricingConfig> {
  const data = await adminFetch<{ config: PricingConfig }>(
    '/api/admin/pricing',
    'GET',
    adminToken,
  );
  return data.config;
}

export async function updatePricingConfig(
  adminToken: string | null,
  config: PricingConfig,
  updatedBy: string,
): Promise<PricingConfig> {
  const data = await adminFetch<{ config: PricingConfig }>(
    '/api/admin/pricing',
    'PUT',
    adminToken,
    { config, updatedBy },
  );
  return data.config;
}