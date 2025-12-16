export interface Env {
  ADMIN_PASSWORD: string;
}

function jsonResponse(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,x-admin-secret',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      ...(init.headers || {}),
    },
  });
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method === 'OPTIONS') {
    return jsonResponse({}, { status: 204 });
  }

  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, { status: 405 });
  }

  const secret = request.headers.get('x-admin-secret');
  if (!secret || secret !== env.ADMIN_PASSWORD) {
    return jsonResponse({ error: 'Unauthorized' }, { status: 401 });
  }

  const sample = [
    {
      id: '1',
      source: 'worker:license-verify',
      level: 'info',
      message: 'License validation request accepted (demo)',
      timestamp: new Date().toISOString(),
    },
  ];

  return jsonResponse(sample);
};
