export interface Env {
  LICENSE_SECRET: string; // set via wrangler secret
}

// HMAC-SHA256 sign using Web Crypto
async function sign(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function verify(lic: any, secret: string): Promise<boolean> {
  if (!lic) return false;
  const { email, plan, exp, signature } = lic;
  if (!email || !plan || !exp || !signature) return false;
  if (exp * 1000 < Date.now()) return false;
  const expected = await sign(`${email}|${plan}|${exp}`, secret);
  return expected === signature;
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);

    // Verify license
    if (url.pathname === '/api/license/verify' && req.method === 'POST') {
      try {
        const lic = await req.json();
        const ok = await verify(lic, env.LICENSE_SECRET);
        return json({ ok });
      } catch {
        return json({ ok: false }, 400);
      }
    }

    // (Optional) Issue license for testing ONLY. Remove in production.
    if (url.pathname === '/api/license/issue' && req.method === 'POST') {
      const { email, plan = 'pro', exp } = await req.json();
      const expTs = exp ?? Math.floor(Date.now() / 1000) + 365 * 24 * 3600; // 1 year
      const signature = await sign(`${email}|${plan}|${expTs}`, env.LICENSE_SECRET);
      return json({ email, plan, exp: expTs, signature });
    }

    return new Response('Not found', { status: 404 });
  },
};
