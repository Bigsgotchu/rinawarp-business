export const onRequest = async ({ request, env, next }) => {
  const url = new URL(request.url);
  if (request.method !== 'POST') return next();
  if (!env.STRIPE_HMAC_SECRET) return next();

  const sign = request.headers.get('x-sign') || '';
  if (!sign) return new Response('unauthorized', { status: 401 });

  const body = await request.clone().arrayBuffer();
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.STRIPE_HMAC_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, body);
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  if (b64 !== sign) return new Response('forbidden', { status: 403 });

  return next();
};
