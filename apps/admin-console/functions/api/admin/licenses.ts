export interface Env {
  ADMIN_API_SECRET: string;
  LICENSING_SERVICE_URL: string; // e.g. https://api.rinawarptech.com/licensing
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS';

interface LicensePayload {
  licenseKey?: string;
  email?: string;
  product?: string;
  plan?: string;
  seats?: number;
  expiresAt?: string; // ISO
  reason?: string;
  notes?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://admin.rinawarptech.com',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
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

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method as Method;

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  const adminSecret = request.headers.get('x-admin-secret');
  if (!adminSecret || adminSecret !== env.ADMIN_API_SECRET) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const backendUrl = env.LICENSING_SERVICE_URL?.replace(/\/+$/, '');
  if (!backendUrl) {
    return jsonResponse(
      { error: 'LICENSING_SERVICE_URL not configured' },
      500,
    );
  }

  try {
    switch (method) {
      case 'GET': {
        // List/search licenses
        const params = new URLSearchParams();
        const q = url.searchParams.get('q');
        const email = url.searchParams.get('email');
        const licenseKey = url.searchParams.get('licenseKey');
        const limit = url.searchParams.get('limit') ?? '50';

        if (q) params.set('q', q);
        if (email) params.set('email', email);
        if (licenseKey) params.set('licenseKey', licenseKey);
        params.set('limit', limit);

        // TODO: adjust path to match your real licensing-service route
        const target = `${backendUrl}/admin/licenses?${params.toString()}`;

        const res = await fetch(target, {
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': env.ADMIN_API_SECRET,
          },
        });

        const data = await res.json().catch(() => null);
        return jsonResponse(
          {
            ok: res.ok,
            status: res.status,
            data,
          },
          res.ok ? 200 : res.status,
        );
      }

      case 'POST': {
        // Create license
        const body = (await request.json().catch(() => null)) as
          | LicensePayload
          | null;
        if (!body?.email || !body.product) {
          return jsonResponse(
            { error: 'email and product are required' },
            400,
          );
        }

        const target = `${backendUrl}/admin/licenses`;
        const res = await fetch(target, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': env.ADMIN_API_SECRET,
          },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => null);
        return jsonResponse(
          {
            ok: res.ok,
            status: res.status,
            data,
          },
          res.ok ? 200 : res.status,
        );
      }

      case 'PATCH': {
        // Extend/modify license
        const body = (await request.json().catch(() => null)) as
          | LicensePayload
          | null;
        if (!body?.licenseKey) {
          return jsonResponse({ error: 'licenseKey is required' }, 400);
        }

        const target = `${backendUrl}/admin/licenses/${encodeURIComponent(
          body.licenseKey,
        )}`;

        const res = await fetch(target, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': env.ADMIN_API_SECRET,
          },
          body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => null);
        return jsonResponse(
          {
            ok: res.ok,
            status: res.status,
            data,
          },
          res.ok ? 200 : res.status,
        );
      }

      case 'DELETE': {
        // Revoke license
        const body = (await request.json().catch(() => null)) as
          | LicensePayload
          | null;
        const licenseKey =
          body?.licenseKey ||
          url.searchParams.get('licenseKey') ||
          undefined;

        if (!licenseKey) {
          return jsonResponse({ error: 'licenseKey is required' }, 400);
        }

        const target = `${backendUrl}/admin/licenses/${encodeURIComponent(
          licenseKey,
        )}`;

        const res = await fetch(target, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': env.ADMIN_API_SECRET,
          },
          body: JSON.stringify({
            reason: body?.reason ?? 'revoked via admin console',
            notes: body?.notes ?? '',
          }),
        });

        const data = await res.json().catch(() => null);
        return jsonResponse(
          {
            ok: res.ok,
            status: res.status,
            data,
          },
          res.ok ? 200 : res.status,
        );
      }

      default:
        return jsonResponse({ error: 'Method not allowed' }, 405);
    }
  } catch (error: any) {
    console.error('Admin licenses error', error);
    return jsonResponse(
      {
        error: 'Internal error',
        message: error?.message ?? String(error),
      },
      500,
    );
  }
};