"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const stripe_1 = __importDefault(require("stripe"));
function jsonError(message, status = 400) {
    return { ok: false, error: message, status };
}
function requireAdmin(c, env) {
    const auth = c.req.header('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
    if (!token || token !== env.ADMIN_TOKEN)
        throw new Error('Unauthorized');
}
function nowIso() {
    return new Date().toISOString();
}
function normalizeEmail(email) {
    if (typeof email !== 'string')
        return null;
    const e = email.trim().toLowerCase();
    return e.includes('@') ? e : null;
}
function randomLicenseKey() {
    // RWTP-XXXX-XXXX-XXXX-XXXX
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const chunk = () => Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    return `RWTP-${chunk()}-${chunk()}-${chunk()}-${chunk()}`;
}
const stripeForWorker = (env) => new stripe_1.default(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27.acacia',
    httpClient: stripe_1.default.createFetchHttpClient(),
});
const app = new hono_1.Hono();
app.use('*', (0, cors_1.cors)({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization', 'Stripe-Signature'],
    allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
}));
/* ----------------------------------------------------------------------------
DB helpers
---------------------------------------------------------------------------- */
async function dbGet(db, sql, params = []) {
    const res = await db
        .prepare(sql)
        .bind(...params)
        .first();
    return res ?? null;
}
async function dbAll(db, sql, params = []) {
    const res = await db
        .prepare(sql)
        .bind(...params)
        .all();
    return res.results ?? [];
}
async function dbRun(db, sql, params = []) {
    await db
        .prepare(sql)
        .bind(...params)
        .run();
}
/* ----------------------------------------------------------------------------
Pricing endpoint: your website can render from this instead of hardcoding.
---------------------------------------------------------------------------- */
app.get('/api/pricing', (c) => {
    const env = c.env;
    const plans = [
        {
            id: 'starter_monthly',
            name: 'Starter',
            interval: 'month',
            priceUsd: 29,
            stripePriceId: env.STRIPE_PRICE_STARTER_MONTHLY,
        },
        {
            id: 'creator_monthly',
            name: 'Creator',
            interval: 'month',
            priceUsd: 69,
            stripePriceId: env.STRIPE_PRICE_CREATOR_MONTHLY,
        },
        {
            id: 'pro_monthly',
            name: 'Pro',
            interval: 'month',
            priceUsd: 99,
            stripePriceId: env.STRIPE_PRICE_PRO_MONTHLY,
        },
    ];
    const lifetime = [
        env.STRIPE_PRICE_STARTER_LIFETIME && {
            id: 'starter_lifetime',
            name: 'Starter (Lifetime)',
            interval: 'lifetime',
            stripePriceId: env.STRIPE_PRICE_STARTER_LIFETIME,
        },
        env.STRIPE_PRICE_CREATOR_LIFETIME && {
            id: 'creator_lifetime',
            name: 'Creator (Lifetime)',
            interval: 'lifetime',
            stripePriceId: env.STRIPE_PRICE_CREATOR_LIFETIME,
        },
        env.STRIPE_PRICE_FINAL_LIFETIME && {
            id: 'final_lifetime',
            name: 'Final (Lifetime)',
            interval: 'lifetime',
            stripePriceId: env.STRIPE_PRICE_FINAL_LIFETIME,
        },
    ].filter(Boolean);
    return c.json({ ok: true, plans, lifetime });
});
/* ----------------------------------------------------------------------------
Downloads manifest: fixes "SHA-256: Pending..." on download page.
---------------------------------------------------------------------------- */
app.get('/api/downloads/latest.json', async (c) => {
    const env = c.env;
    // KV cache first
    if (env.DOWNLOADS_KV) {
        const cached = await env.DOWNLOADS_KV.get('terminal-pro/latest.json');
        if (cached)
            return c.json(JSON.parse(cached));
    }
    const row = await dbGet(env.DB, `SELECT product, version, linux_appimage_url, linux_appimage_sha256, notes_url, updated_at
     FROM downloads_latest WHERE product = ? LIMIT 1`, ['terminal-pro']);
    if (!row)
        return c.json({ ok: false, error: 'No latest build set' }, 404);
    const payload = {
        ok: true,
        product: row.product,
        version: row.version,
        linux: {
            appimage: {
                url: row.linux_appimage_url,
                sha256: row.linux_appimage_sha256,
            },
        },
        notesUrl: row.notes_url,
        updatedAt: row.updated_at,
    };
    if (env.DOWNLOADS_KV) {
        await env.DOWNLOADS_KV.put('terminal-pro/latest.json', JSON.stringify(payload), {
            expirationTtl: 300,
        });
    }
    return c.json(payload);
});
/* ----------------------------------------------------------------------------
Admin: set latest download metadata (wire this to your release pipeline).
---------------------------------------------------------------------------- */
app.put('/api/admin/downloads/latest', async (c) => {
    const env = c.env;
    try {
        requireAdmin(c, env);
    }
    catch {
        return c.json(jsonError('Unauthorized', 401), 401);
    }
    const body = await c.req.json();
    const product = body.product ?? 'terminal-pro';
    if (!body.version || !body.linuxAppImageUrl || !body.linuxAppImageSha256) {
        return c.json(jsonError('Missing required fields: version, linuxAppImageUrl, linuxAppImageSha256'), 400);
    }
    await dbRun(env.DB, `INSERT INTO downloads_latest (product, version, linux_appimage_url, linux_appimage_sha256, notes_url, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(product) DO UPDATE SET
       version=excluded.version,
       linux_appimage_url=excluded.linux_appimage_url,
       linux_appimage_sha256=excluded.linux_appimage_sha256,
       notes_url=excluded.notes_url,
       updated_at=excluded.updated_at`, [
        product,
        body.version,
        body.linuxAppImageUrl,
        body.linuxAppImageSha256,
        body.notesUrl ?? null,
        nowIso(),
    ]);
    if (env.DOWNLOADS_KV) {
        await env.DOWNLOADS_KV.delete('terminal-pro/latest.json');
    }
    return c.json({ ok: true });
});
/* ----------------------------------------------------------------------------
Stripe checkout session
---------------------------------------------------------------------------- */
const PLAN_TO_PRICE = (env) => ({
    starter_monthly: env.STRIPE_PRICE_STARTER_MONTHLY,
    creator_monthly: env.STRIPE_PRICE_CREATOR_MONTHLY,
    pro_monthly: env.STRIPE_PRICE_PRO_MONTHLY,
    starter_lifetime: env.STRIPE_PRICE_STARTER_LIFETIME,
    creator_lifetime: env.STRIPE_PRICE_CREATOR_LIFETIME,
    final_lifetime: env.STRIPE_PRICE_FINAL_LIFETIME,
});
app.post('/api/stripe/create-checkout-session', async (c) => {
    const env = c.env;
    const stripe = stripeForWorker(env);
    const body = await c.req.json();
    const planId = String(body.planId ?? '');
    const priceId = PLAN_TO_PRICE(env)[planId];
    if (!priceId)
        return c.json(jsonError('Invalid planId'), 400);
    const email = normalizeEmail(body.email);
    const session = await stripe.checkout.sessions.create({
        mode: planId.endsWith('_monthly') ? 'subscription' : 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: env.APP_SUCCESS_URL,
        cancel_url: env.APP_CANCEL_URL,
        customer_email: email ?? undefined,
        allow_promotion_codes: true,
        metadata: {
            planId,
            product: 'terminal-pro',
        },
    });
    return c.json({ ok: true, url: session.url });
});
/* ----------------------------------------------------------------------------
Stripe customer portal session (Manage billing button in app / website)
---------------------------------------------------------------------------- */
app.post('/api/stripe/create-portal-session', async (c) => {
    const env = c.env;
    const stripe = stripeForWorker(env);
    const body = await c.req.json();
    const email = normalizeEmail(body.email);
    let customerId = body.stripeCustomerId ? String(body.stripeCustomerId) : null;
    if (!customerId && email) {
        const row = await dbGet(env.DB, `SELECT stripe_customer_id FROM customers WHERE email = ? LIMIT 1`, [email]);
        customerId = row?.stripe_customer_id ?? null;
    }
    if (!customerId)
        return c.json(jsonError('Missing customer'), 400);
    const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: env.BILLING_PORTAL_RETURN_URL,
    });
    return c.json({ ok: true, url: portal.url });
});
/* ----------------------------------------------------------------------------
Stripe webhook: idempotent + license issuance
---------------------------------------------------------------------------- */
app.post('/api/stripe/webhook', async (c) => {
    const env = c.env;
    const stripe = stripeForWorker(env);
    const sig = c.req.header('stripe-signature');
    if (!sig)
        return c.json(jsonError('Missing Stripe-Signature', 400), 400);
    const raw = await c.req.raw.text();
    let event;
    try {
        event = stripe.webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET);
    }
    catch (e) {
        return c.json(jsonError(`Webhook signature verification failed: ${e instanceof Error ? e.message : String(e)}`, 400), 400);
    }
    // Idempotency
    const existing = await dbGet(env.DB, `SELECT id FROM stripe_events WHERE id = ? LIMIT 1`, [event.id]);
    if (existing)
        return c.json({ ok: true, deduped: true });
    await dbRun(env.DB, `INSERT INTO stripe_events (id, type, created_at) VALUES (?, ?, ?)`, [
        event.id,
        event.type,
        nowIso(),
    ]);
    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const planId = String(session.metadata?.planId ?? '');
            const product = String(session.metadata?.product ?? 'terminal-pro');
            const email = normalizeEmail(session.customer_details?.email ?? session.customer_email);
            const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
            if (!customerId)
                throw new Error('Missing Stripe customer id');
            if (email) {
                await dbRun(env.DB, `INSERT INTO customers (stripe_customer_id, email, created_at)
           VALUES (?, ?, ?)
           ON CONFLICT(stripe_customer_id) DO UPDATE SET email=excluded.email`, [customerId, email, nowIso()]);
            }
            else {
                await dbRun(env.DB, `INSERT INTO customers (stripe_customer_id, email, created_at)
           VALUES (?, NULL, ?)
           ON CONFLICT(stripe_customer_id) DO NOTHING`, [customerId, nowIso()]);
            }
            // Create one license per purchase (you can expand to seats later)
            const licenseKey = randomLicenseKey();
            const entitlement = planId; // keep simple; can map to feature flags later
            await dbRun(env.DB, `INSERT INTO licenses
          (license_key, stripe_customer_id, product, plan_id, entitlement, status, activation_limit, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE', 3, ?, ?)`, [licenseKey, customerId, product, planId, entitlement, nowIso(), nowIso()]);
            // Optional: email delivery hook (Resend/Postmark/etc.) — implement later.
            // For now, user can retrieve via /success?session_id=... -> you can add an API that returns license by session id.
            return c.json({ ok: true });
        }
        if (event.type === 'customer.subscription.deleted') {
            const sub = event.data.object;
            const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
            if (customerId) {
                await dbRun(env.DB, `UPDATE licenses SET status='EXPIRED', updated_at=? WHERE stripe_customer_id=?`, [nowIso(), customerId]);
            }
            return c.json({ ok: true });
        }
        if (event.type === 'invoice.payment_failed') {
            const invoice = event.data.object;
            const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
            if (customerId) {
                await dbRun(env.DB, `UPDATE licenses SET status='GRACE', updated_at=? WHERE stripe_customer_id=?`, [nowIso(), customerId]);
            }
            return c.json({ ok: true });
        }
        if (event.type === 'charge.refunded') {
            const charge = event.data.object;
            const customerId = typeof charge.customer === 'string' ? charge.customer : charge.customer?.id;
            if (customerId) {
                await dbRun(env.DB, `UPDATE licenses SET status='REVOKED', updated_at=? WHERE stripe_customer_id=?`, [nowIso(), customerId]);
            }
            return c.json({ ok: true });
        }
        return c.json({ ok: true, ignored: true });
    }
    catch (e) {
        // Keep event recorded; you can inspect and reprocess manually.
        return c.json(jsonError(`Webhook processing error: ${e instanceof Error ? e.message : String(e)}`, 500), 500);
    }
});
async function getLicense(db, licenseKey) {
    return dbGet(db, `SELECT license_key, stripe_customer_id, product, plan_id, entitlement, status, activation_limit
     FROM licenses WHERE license_key = ? LIMIT 1`, [licenseKey]);
}
app.post('/api/license/activate', async (c) => {
    const env = c.env;
    const body = await c.req.json();
    const licenseKey = String(body.licenseKey ?? '').trim();
    const machineHash = String(body.machineHash ?? '').trim();
    if (!licenseKey || !machineHash)
        return c.json(jsonError('Missing licenseKey or machineHash'), 400);
    const lic = await getLicense(env.DB, licenseKey);
    if (!lic)
        return c.json({ ok: false, error: 'INVALID_LICENSE' }, 404);
    if (lic.status === 'REVOKED')
        return c.json({ ok: false, error: 'REVOKED' }, 403);
    if (lic.status === 'EXPIRED')
        return c.json({ ok: false, error: 'EXPIRED' }, 403);
    const activations = await dbAll(env.DB, `SELECT machine_hash FROM activations WHERE license_key = ?`, [licenseKey]);
    const already = activations.some((a) => a.machine_hash === machineHash);
    if (!already && activations.length >= lic.activation_limit) {
        return c.json({ ok: false, error: 'ACTIVATION_LIMIT' }, 403);
    }
    if (!already) {
        await dbRun(env.DB, `INSERT INTO activations (license_key, machine_hash, first_seen_at, last_seen_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(license_key, machine_hash) DO UPDATE SET last_seen_at=excluded.last_seen_at`, [licenseKey, machineHash, nowIso(), nowIso()]);
    }
    else {
        await dbRun(env.DB, `UPDATE activations SET last_seen_at=? WHERE license_key=? AND machine_hash=?`, [nowIso(), licenseKey, machineHash]);
    }
    return c.json({
        ok: true,
        status: lic.status,
        product: lic.product,
        planId: lic.plan_id,
        entitlement: lic.entitlement,
    });
});
app.post('/api/license/validate', async (c) => {
    const env = c.env;
    const body = await c.req.json();
    const licenseKey = String(body.licenseKey ?? '').trim();
    const machineHash = String(body.machineHash ?? '').trim();
    if (!licenseKey || !machineHash)
        return c.json(jsonError('Missing licenseKey or machineHash'), 400);
    const lic = await getLicense(env.DB, licenseKey);
    if (!lic)
        return c.json({ ok: false, error: 'INVALID_LICENSE' }, 404);
    const activation = await dbGet(env.DB, `SELECT machine_hash FROM activations WHERE license_key=? AND machine_hash=? LIMIT 1`, [licenseKey, machineHash]);
    if (!activation)
        return c.json({ ok: false, error: 'NOT_ACTIVATED' }, 403);
    // update heartbeat
    await dbRun(env.DB, `UPDATE activations SET last_seen_at=? WHERE license_key=? AND machine_hash=?`, [nowIso(), licenseKey, machineHash]);
    return c.json({
        ok: true,
        status: lic.status,
        product: lic.product,
        planId: lic.plan_id,
        entitlement: lic.entitlement,
    });
});
app.get('/health', (c) => c.json({ ok: true }));
exports.default = app;
