/// <reference types="@cloudflare/workers-types" />

import type { KVNamespace, PagesFunction } from '@cloudflare/workers-types';
import Stripe from 'stripe';

// Global Buffer for Stripe compatibility
declare const Buffer: {
  from(input: string | Uint8Array, encoding?: string): Buffer;
};

interface Env {
  GITHUB_WEBHOOK_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  SLACK_SIGNING_SECRET: string;
  KV: KVNamespace;
}

interface GitHubEvent {
  action?: string;
  type?: string;
  [key: string]: unknown;
}

interface SlackEvent {
  [key: string]: unknown;
}

async function verifyGitHubSignature(
  secret: string,
  payload: Uint8Array,
  header?: string,
): Promise<boolean> {
  if (!header) return false;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const signature = await crypto.subtle.sign('HMAC', key, payload as any);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const expected = `sha256=${Array.from(new Uint8Array(signature as ArrayBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;

  return header === expected;
}

async function verifySlackSignature(
  secret: string,
  payload: Uint8Array,
  signature?: string | null,
  timestamp?: string | null,
): Promise<boolean> {
  if (!signature || !timestamp) return false;

  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);
  if (Math.abs(now - ts) > 300) return false; // 5 minutes

  const basestring = `v0:${timestamp}:${new TextDecoder().decode(payload)}`;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(basestring));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const expected = `v0=${Array.from(new Uint8Array(sig as ArrayBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;

  return signature === expected;
}

export const onRequestPost = async (context: {
  params: { provider: string };
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { provider } = context.params;
  const { request, env } = context;

  try {
    // Get raw body
    const rawBody = await request.arrayBuffer();
    const bodyBuffer = new Uint8Array(rawBody);

    switch (provider) {
      case 'github': {
        const sig = request.headers.get('X-Hub-Signature-256') || '';
        const secret = env.GITHUB_WEBHOOK_SECRET;
        if (!secret) return new Response('Missing GITHUB_WEBHOOK_SECRET', { status: 500 });

        const isValid = await verifyGitHubSignature(secret, bodyBuffer, sig);
        if (!isValid) {
          return new Response('Invalid GitHub signature', { status: 401 });
        }

        // Replay protection
        const deliveryId = request.headers.get('X-GitHub-Delivery');
        if (deliveryId) {
          const key = `wh:github:${deliveryId}`;
          const seen = await env.KV.get(key);
          if (seen) return new Response('ok', { status: 200 }); // already processed
          await env.KV.put(key, '1', { expirationTtl: 15 * 60 }); // 15 minutes
        }

        // Process event
        const event = JSON.parse(new TextDecoder().decode(bodyBuffer)) as GitHubEvent;
        console.log('GitHub webhook:', event.action || event.type);
        // ... handle push, release, etc.
        return new Response('ok', { status: 200 });
      }

      case 'stripe': {
        const stripe = new Stripe(env.STRIPE_SECRET_KEY);
        const sig = request.headers.get('Stripe-Signature') || '';
        const secret = env.STRIPE_WEBHOOK_SECRET;
        if (!secret) return new Response('Missing STRIPE_WEBHOOK_SECRET', { status: 500 });

        let event: Stripe.Event;
        try {
          // Convert Uint8Array to Buffer for Stripe compatibility
          const bodyString = new TextDecoder().decode(bodyBuffer);
          const bodyBufferForStripe = Buffer.from(bodyString);
          event = stripe.webhooks.constructEvent(bodyBufferForStripe, sig, secret);
        } catch (e) {
          const error = e as Error;
          return new Response(`Invalid Stripe signature: ${error.message}`, { status: 400 });
        }

        // Replay protection
        const key = `wh:stripe:${event.id}`;
        const seen = await env.KV.get(key);
        if (seen) return new Response('ok', { status: 200 }); // already processed
        await env.KV.put(key, '1', { expirationTtl: 24 * 60 * 60 }); // 24 hours

        // ... handle event.type
        if (event.type === 'checkout.session.completed') {
          console.log('Checkout completed:', event.data.object.id);
        }
        return new Response('ok', { status: 200 });
      }

      case 'slack': {
        const secret = env.SLACK_SIGNING_SECRET;
        if (!secret) return new Response('Missing SLACK_SIGNING_SECRET', { status: 500 });
        const sig = request.headers.get('X-Slack-Signature');
        const timestamp = request.headers.get('X-Slack-Request-Timestamp');

        const isValid = await verifySlackSignature(secret, bodyBuffer, sig, timestamp);
        if (!isValid) {
          return new Response('Invalid Slack signature', { status: 401 });
        }

        const payload = JSON.parse(new TextDecoder().decode(bodyBuffer)) as SlackEvent;
        // ... handle
        return new Response('ok', { status: 200 });
      }

      default:
        return new Response('Unknown provider', { status: 404 });
    }
  } catch (err) {
    const error = err as Error;
    return new Response(`Webhook error: ${error.message}`, { status: 500 });
  }
};
