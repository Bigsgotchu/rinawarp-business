import type { KVNamespace } from '@cloudflare/workers-types';

export interface Env {
  ADMIN_API_SECRET: string;
  PRICING_KV: KVNamespace; // bind this in Cloudflare Pages
}

type Method = 'GET' | 'PUT' | 'OPTIONS';

interface PriceEntry {
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

interface PricingConfig {
  version: number;
  updatedAt: string;
  updatedBy: string;
  products: {
    terminal: PriceEntry[];
    amvc: PriceEntry[];
    bundles: PriceEntry[];
  };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://admin.rinawarptech.com',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret',
  'Access-Control-Allow-Credentials': 'true',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

const KV_KEY = 'pricing_config_v1';

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const method = request.method as Method;

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const adminSecret = request.headers.get('x-admin-secret');
  if (!adminSecret || adminSecret !== env.ADMIN_API_SECRET) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    if (method === 'GET') {
      const raw = await env.PRICING_KV.get(KV_KEY);
      if (!raw) {
        // First-time default
        const empty: PricingConfig = {
          version: 1,
          updatedAt: new Date().toISOString(),
          updatedBy: 'system',
          products: {
            terminal: [],
            amvc: [],
            bundles: [],
          },
        };
        return jsonResponse({ config: empty, isDefault: true });
      }
      const config = JSON.parse(raw) as PricingConfig;
      return jsonResponse({ config, isDefault: false });
    }

    if (method === 'PUT') {
      const body = (await request.json().catch(() => null)) as {
        config?: PricingConfig;
        updatedBy?: string;
      } | null;

      if (!body?.config) {
        return jsonResponse({ error: 'config is required' }, 400);
      }

      const { config } = body;
      const now = new Date().toISOString();

      const updated: PricingConfig = {
        ...config,
        version: (config.version ?? 0) + 1,
        updatedAt: now,
        updatedBy: body.updatedBy ?? 'admin-console',
      };

      await env.PRICING_KV.put(KV_KEY, JSON.stringify(updated));

      return jsonResponse({ ok: true, config: updated }, 200);
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (error: any) {
    console.error('Admin pricing error', error);
    return jsonResponse(
      {
        error: 'Internal error',
        message: error?.message ?? String(error),
      },
      500,
    );
  }
};
