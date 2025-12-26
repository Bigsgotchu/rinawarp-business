// Helper to standardize JSON responses
function jsonResponse(status: number, body: any): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
    },
  });
}

/**
 * POST /api/admin/licenses/validate
 * Accepts:
 *   - application/x-www-form-urlencoded (HTML form: key=<license>)
 *   - application/json ({ "key": "..." })
 * Returns JSON:
 *   { ok, status, message, ... }
 */
export async function handleLicenseValidate(request: Request, env: Env): Promise<Response> {
  // Parse input
  let key: string | null = null;
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      key = (body.key || "").trim();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData();
      key = (form.get("key") || "").toString().trim();
    } else {
      // Fallback: try formData anyway (for odd clients)
      const form = await request.formData().catch(() => null);
      if (form) {
        key = (form.get("key") || "").toString().trim();
      }
    }
  } catch (err) {
    return jsonResponse(400, {
      ok: false,
      status: "error",
      message: "Unable to parse request body.",
    });
  }

  if (!key) {
    return jsonResponse(400, {
      ok: false,
      status: "error",
      message: "No license key provided.",
    });
  }

  // Look up license in KV
  const kvKey = `license:${key}`;
  const record = await env.LICENSES_KV.get(kvKey, "json");

  if (!record) {
    return jsonResponse(200, {
      ok: false,
      status: "invalid",
      message: "This license key is not recognized.",
    });
  }

  // record is expected to look like:
  // {
  //   key: "XXXX-XXXX-XXXX",
  //   product: "terminal-pro",
  //   status: "active" | "expired" | "revoked",
  //   issuedAt: "2025-01-10T00:00:00.000Z",
  //   expiresAt: "2025-08-01T00:00:00.000Z" | null,
  //   ...
  // }

  const now = Date.now();
  let status = record.status || "active";
  const expiresAt = record.expiresAt ? Date.parse(record.expiresAt) : null;

  // If we have an expiry date and it's passed, treat as expired
  if (expiresAt && expiresAt < now) {
    status = "expired";
  }

  if (status === "revoked") {
    return jsonResponse(200, {
      ok: false,
      status: "revoked",
      product: record.product || null,
      message: "This license has been revoked. Contact support if you believe this is an error.",
    });
  }

  if (status === "expired") {
    return jsonResponse(200, {
      ok: false,
      status: "expired",
      product: record.product || null,
      expires: record.expiresAt || null,
      message: "This license key has expired. Please renew or purchase a new license.",
    });
  }

  // At this point, license is considered valid
  const responseBody = {
    ok: true,
    status: "valid",
    product: record.product || "terminal-pro",
    license: key,
    issued: record.issuedAt || null,
    expires: record.expiresAt || null,
    message: "License successfully validated.",
  };

  // Optionally track lastValidatedAt
  try {
    await env.LICENSES_KV.put(
      kvKey,
      JSON.stringify({
        ...record,
        lastValidatedAt: new Date().toISOString(),
      })
    );
  } catch (e) {
    // non-fatal, don't break validation on KV write failure
  }

  return jsonResponse(200, responseBody);
}
