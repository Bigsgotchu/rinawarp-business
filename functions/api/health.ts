/// <reference types="@cloudflare/workers-types" />

// functions/api/health.ts

export interface Env {
  // Environment variables for health check
}

/* ==============================
   Utility Helpers
============================== */

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/* ==============================
   Main Entry
============================== */

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    gateway: 'cloudflare-pages',
    colo: context.request.cf?.colo ?? 'unknown',
    version: '1.0.2',
  });
};