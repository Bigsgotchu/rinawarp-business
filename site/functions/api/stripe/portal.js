// /functions/api/stripe/portal.js (REPLACE)
// Accepts { email } OR { customer }. If email, look up KV_STRIPE cust:<email>.
import { json, formBody, stripeFetch, okOrThrow, originFromEnv } from './_utils';

export const onRequestPost = async ({ request, env }) => {
  try {
    const body = await request.json();
    const origin = originFromEnv(env);
    let customer = (body.customer || '').trim();

    if (!customer) {
      const email = String(body.email || '').toLowerCase().trim();
      if (!email) return json({ ok:false, error:'email or customer required' }, { status:400 });
      customer = await env.KV_STRIPE.get(`cust:${email}`) || '';
      if (!customer) return json({ ok:false, error:'no customer found for email' }, { status:404 });
    }

    const p = formBody({ customer, return_url: `${origin}/pricing` });
    const res = await okOrThrow(stripeFetch(env, '/v1/billing_portal/sessions', { method: 'POST', body: p }));
    const data = await res.json();
    return json({ ok:true, url: data.url });
  } catch (e) {
    return json({ ok:false, error: e.message || 'portal error' }, { status:500 });
  }
};
