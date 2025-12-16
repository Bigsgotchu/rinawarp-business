import crypto from 'node:crypto';

export type Provider = 'github' | 'stripe' | 'slack';

export function constantTimeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function signHmacSHA256(secret: string, payload: Buffer) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// GitHub: "X-Hub-Signature-256: sha256=<hex>"
export function verifyGitHubSignature(secret: string, payload: Buffer, header?: string) {
  if (!header) return false;
  const expected = `sha256=${signHmacSHA256(secret, payload)}`;
  return constantTimeEqual(header, expected);
}

// Stripe: stripe.webhooks.constructEvent expects the exact raw body
// If you don't use the SDK, you can reproduce their verification format,
// but the SDK is strongly recommended.
export function verifyPlainHmac(secret: string, payload: Buffer, header?: string) {
  // Replace with provider-specific parser if needed
  if (!header) return false;
  const expected = signHmacSHA256(secret, payload);
  return constantTimeEqual(header, expected);
}

// Slack: "X-Slack-Signature: v0=<hex>", "X-Slack-Request-Timestamp: <unix>"
export function verifySlackSignature(
  secret: string,
  payload: Buffer,
  signature?: string,
  timestamp?: string,
) {
  if (!signature || !timestamp) return false;

  // Check timestamp skew (allow 5 minutes)
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);
  if (Math.abs(now - ts) > 300) return false; // 5 minutes

  // Create basestring: "v0:<timestamp>:<body>"
  const basestring = `v0:${timestamp}:${payload.toString('utf8')}`;
  const expected = `v0=${signHmacSHA256(secret, Buffer.from(basestring))}`;
  return constantTimeEqual(signature, expected);
}
