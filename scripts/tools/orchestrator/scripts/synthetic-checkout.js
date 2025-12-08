import fetch from 'node-fetch';
const API = process.env.CHECKOUT_URL || 'https://staging.example.com/checkout';
const WEBHOOK_POKE = process.env.WEBHOOK_POKE || 'https://staging.example.com/test/webhook';
const run = async () => {
  const start = Date.now();
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 100, currency: 'usd', mode: 'test' }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Checkout failed: ${res.status}`);
  await fetch(WEBHOOK_POKE, { method: 'POST' });
  const ms = Date.now() - start;
  console.log(`Synthetic checkout ok in ${ms}ms`, json);
};
run().catch((err) => {
  console.error(err);
  process.exit(1);
});
