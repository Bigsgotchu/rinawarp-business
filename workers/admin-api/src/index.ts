export interface Env {
  ADMIN_API_SECRET: string;
  BILLING_KV: KVNamespace;
  LICENSES_KV: KVNamespace;
}

interface License {
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

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function authenticate(request: Request, env: Env): boolean {
  const authHeader = request.headers.get('x-admin-secret');
  return authHeader === env.ADMIN_API_SECRET;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Authenticate all admin API requests
    if (!authenticate(request, env)) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret',
        },
      });
    }

    try {
      // LICENSES API
      if (url.pathname === '/api/admin/licenses' && request.method === 'GET') {
        const { searchParams } = url;
        const q = searchParams.get('q') || '';
        const email = searchParams.get('email') || '';
        const licenseKey = searchParams.get('licenseKey') || '';
        const limit = parseInt(searchParams.get('limit') || '100');

        // In a real implementation, you would query your database or KV store
        // For now, we'll return mock data
        const mockLicenses: License[] = [
          {
            licenseKey: 'LIC-TERMINAL-PRO-001',
            email: 'admin@rinawarptech.com',
            product: 'terminal-pro',
            plan: 'pro',
            status: 'active',
            createdAt: '2025-01-01T00:00:00Z',
            expiresAt: '2026-01-01T00:00:00Z',
          },
        ];

        const filtered = mockLicenses.filter((lic) => {
          return (
            (q ? lic.email.includes(q) || lic.licenseKey.includes(q) : true) &&
            (email ? lic.email === email : true) &&
            (licenseKey ? lic.licenseKey === licenseKey : true)
          );
        });

        return jsonResponse({ data: filtered.slice(0, limit) });

      } else if (url.pathname === '/api/admin/licenses' && request.method === 'POST') {
        const body = await request.json();
        const newLicense: License = {
          licenseKey: `LIC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          email: body.email,
          product: body.product,
          plan: body.plan,
          seats: body.seats,
          status: 'active',
          createdAt: new Date().toISOString(),
          expiresAt: body.expiresAt,
          notes: body.notes,
        };

        // In a real implementation, you would store this in your database or KV store
        return jsonResponse({ data: newLicense }, 201);

      } else if (url.pathname === '/api/admin/licenses' && request.method === 'PATCH') {
        const body = await request.json();
        // In a real implementation, you would update the license in your database or KV store
        return jsonResponse({ data: { ...body, status: 'updated' } });

      } else if (url.pathname === '/api/admin/licenses' && request.method === 'DELETE') {
        const body = await request.json();
        // In a real implementation, you would delete the license from your database or KV store
        return jsonResponse({ success: true });

      } else if (url.pathname === '/api/admin/pricing' && request.method === 'GET') {
        // In a real implementation, you would fetch this from your database or KV store
        const mockPricing: PricingConfig = {
          version: 1,
          updatedAt: new Date().toISOString(),
          updatedBy: 'system',
          products: {
            terminal: [
              {
                id: 'terminal-pro',
                stripePriceId: 'price_123',
                name: 'Terminal Pro',
                description: 'Advanced terminal with AI features',
                type: 'subscription',
                amount: 1999,
                currency: 'usd',
                active: true,
              },
            ],
            amvc: [
              {
                id: 'ai-mvc-starter',
                stripePriceId: 'price_456',
                name: 'AI Music Video Creator - Starter',
                description: 'Basic AI music video creation',
                type: 'one_time',
                amount: 9999,
                currency: 'usd',
                active: true,
              },
            ],
            bundles: [
              {
                id: 'bundle',
                stripePriceId: 'price_789',
                name: 'Complete Bundle',
                description: 'Terminal Pro + AI Music Video Creator',
                type: 'subscription',
                amount: 2999,
                currency: 'usd',
                active: true,
              },
            ],
          },
        };

        return jsonResponse({ config: mockPricing });

      } else if (url.pathname === '/api/admin/pricing' && request.method === 'PUT') {
        const body = await request.json();
        // In a real implementation, you would update the pricing in your database or KV store
        return jsonResponse({ config: body.config });

      } else if (url.pathname === '/api/admin/billing-summary' && request.method === 'GET') {
        // Mock billing summary
        const billingSummary = {
          totalRevenue: 125000,
          activeSubscriptions: 42,
          pendingPayments: 3,
          recentPurchases: [
            {
              id: 'ch_123',
              amount: 1999,
              customer: 'customer_1',
              product: 'terminal-pro',
              date: '2025-01-15T10:30:00Z',
            },
          ],
        };

        return jsonResponse(billingSummary);
      }

      return jsonResponse({ error: 'Not found' }, 404);
    } catch (error) {
      console.error('Admin API error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  },
};