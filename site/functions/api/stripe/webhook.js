import { json } from './_utils';

// HMAC verify (Stripe v1)
async function verifyStripe(bodyText, sigHeader, secret) {
  const map = Object.fromEntries(sigHeader.split(',').map((p) => p.split('=')));
  const signed = `${map.t}.${bodyText}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(signed));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return hex === map.v1;
}

function uuid4() {
  // RFC4122-ish UUID
  const a = crypto.getRandomValues(new Uint8Array(16));
  a[6] = (a[6] & 0x0f) | 0x40;
  a[8] = (a[8] & 0x3f) | 0x80;
  const toHex = (n) => n.toString(16).padStart(2, '0');
  const s = [...a].map(toHex).join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

export const onRequestPost = async ({ request, env }) => {
  try {
    const sig = request.headers.get('stripe-signature') || '';
    const bodyText = await request.text();
    const ok = await verifyStripe(bodyText, sig, env.STRIPE_WEBHOOK_SECRET);
    if (!ok) return json({ ok: false, error: 'invalid signature' }, { status: 400 });

    const evt = JSON.parse(bodyText);

    if (evt.type === 'checkout.session.completed') {
      const s = evt.data.object;
      const email = (s.customer_details?.email || s.customer_email || '').toLowerCase();
      const customer = s.customer || null;
      if (email && customer) {
        // One license per email (idempotent)
        const existing = await env.KV_STRIPE.get(`lic:${email}`);
        const licenseKey = existing || `RWP-${uuid4().toUpperCase()}`;
        await env.KV_STRIPE.put(`lic:${email}`, licenseKey);
        await env.KV_STRIPE.put(`cust:${email}`, customer);
        // Optional: record plan/price for support
        const meta = {
          time: Date.now(),
          mode: s.mode,
          price: s?.line_items?.[0]?.price?.id || null,
        };
        await env.KV_STRIPE.put(`meta:${email}`, JSON.stringify(meta));
      }
    }

    // (Optional) manage subscription lifecycle here…

    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: e.message || 'webhook error' }, { status: 500 });
  }
};
