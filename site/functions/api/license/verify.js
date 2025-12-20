export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const email = (url.searchParams.get('email') || '').toLowerCase();
  const key = url.searchParams.get('key') || '';
  if (!email || !key) return new Response(JSON.stringify({ ok:false, error:'email and key required' }), { status:400, headers:{'content-type':'application/json'} });

  const stored = await env.KV_STRIPE.get(`lic:${email}`);
  const ok = !!stored && stored === key;
  return new Response(JSON.stringify({ ok, email, key: ok ? key : null }), { headers:{'content-type':'application/json'} });
};
