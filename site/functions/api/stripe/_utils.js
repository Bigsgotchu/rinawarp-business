export const json = (data, init = {}) =>
  new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' }, ...init });

export function formBody(obj) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj))
    if (v !== undefined && v !== null) p.append(k, String(v));
  return p;
}

export function stripeFetch(env, path, init = {}) {
  const url = `https://api.stripe.com${path}`;
  const headers = new Headers(init.headers || {});
  headers.set('authorization', `Bearer ${env.STRIPE_SECRET_KEY}`);
  headers.set('content-type', headers.get('content-type') || 'application/x-www-form-urlencoded');
  return fetch(url, { ...init, headers });
}

export function okOrThrow(res) {
  if (!res.ok) throw new Error(`Stripe ${res.status}`);
  return res;
}

export function originFromEnv(env) {
  return (env.SITE_BASE || '').replace(/\/$/, '');
}
