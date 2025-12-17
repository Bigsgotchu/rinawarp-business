import Stripe from 'stripe';

// Map product → asset URL (GitHub Release).
const assetMap: Record<string, string> = {
  terminal_pro:
    'https://github.com/<org>/<repo>/releases/download/v1.0.0/rinawarp-terminal-macos-arm64.dmg',
  video_creator_pro:
    'https://github.com/<org>/<repo>/releases/download/v1.0.0/rinawarp-video-creator-macos-arm64.dmg',
};

export default async (req: Request) => {
  try {
    const url = new URL(req.url);
    const session_id = url.searchParams.get('session_id');
    const product = url.searchParams.get('product') || '';
    if (!session_id || !product) return new Response('Bad request', { status: 400 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-09-30.clover' });
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') return new Response('Payment required', { status: 402 });

    const asset = assetMap[product];
    if (!asset) return new Response('Unknown product', { status: 404 });

    const ghHeaders: HeadersInit = { Accept: 'application/octet-stream' };
    if (process.env.GITHUB_TOKEN) ghHeaders['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;

    const resp = await fetch(asset, { headers: ghHeaders });
    if (!resp.ok) return new Response('Asset not available', { status: 502 });

    const headers = new Headers(resp.headers);
    headers.set('cache-control', 'no-store');
    headers.set('content-disposition', `attachment; filename=${asset.split('/').pop()}`);
    return new Response(resp.body, { status: 200, headers });
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
};
