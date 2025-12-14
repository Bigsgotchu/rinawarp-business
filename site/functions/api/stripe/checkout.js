import { json, formBody, stripeFetch, okOrThrow, originFromEnv } from './_utils';

export const onRequestPost = async ({ request, env }) => {
  try {
    const body = await request.json();
    const priceId = body.priceId;
    const mode = body.mode || 'subscription'; // 'payment' or 'subscription'
    const quantity = Math.max(1, Number(body.quantity || 1));
    if (!priceId) return json({ ok: false, error: 'priceId required' }, { status: 400 });

    const origin = originFromEnv(env);
    const params = formBody({
      mode,
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': quantity,
      allow_promotion_codes: 'true',
      automatic_tax: 'enabled',
      billing_address_collection: 'auto'
    });

    const res = await okOrThrow(stripeFetch(env, '/v1/checkout/sessions', { method: 'POST', body: params }));
    const session = await res.json();
    return json({ ok: true, id: session.id, url: session.url });
  } catch (e) {
    return json({ ok: false, error: e.message || 'checkout error' }, { status: 500 });
  }
};
