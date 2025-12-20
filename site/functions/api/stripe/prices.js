import { json, stripeFetch, okOrThrow } from './_utils';

export const onRequestGet = async ({ env }) => {
  try {
    // Expand product for names/descriptions; only active prices
    const res = await okOrThrow(stripeFetch(env, `/v1/prices?active=true&expand[]=data.product&limit=100`, { method: 'GET' }));
    const data = await res.json();
    // Normalize to minimal fields used by UI; optionally filter by product metadata if you want
    const list = (data.data || [])
      .filter(p => p.product && p.product.active)
      .map(p => ({
        id: p.id,
        product: { id: p.product.id, name: p.product.name, description: p.product.description || '' },
        unit_amount: p.unit_amount,
        currency: p.currency,
        type: p.type,
        recurring: p.recurring
      }));
    return json({ ok: true, data: list });
  } catch (e) {
    return json({ ok: false, error: e.message || 'prices error' }, { status: 500 });
  }
};
