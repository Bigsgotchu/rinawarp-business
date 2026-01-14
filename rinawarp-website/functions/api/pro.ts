import type { PagesFunction } from "https://deno.land/x/wrangler@v3/types.d.ts";
import { validateLicense } from "../lib/auth";

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  if (!env.DB) {
    return new Response("Database not configured", { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const email = request.headers.get("x-user-email");
  
  const result = await validateLicense(authHeader, env.DB, email);

  if (!result) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (typeof result === "string") {
    // Legacy mode without DB
    return Response.json({
      ok: true,
      email: result,
      features: ["agent", "extensions", "priority-api"]
    });
  }

  if (result.error) {
    return new Response(result.error, { status: 403 });
  }

  return Response.json({
    ok: true,
    email: result.email,
    plan: result.plan,
    seats: result.seats,
    features: ["agent", "extensions", "priority-api", "usage-monitoring"]
  });
};