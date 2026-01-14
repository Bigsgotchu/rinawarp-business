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
    return new Response("Payment required", { status: 402 });
  }

  if (typeof result === "string") {
    // Legacy mode without DB
    return Response.redirect(
      "https://download.rinawarptech.com/rinawarp-pro.vsix",
      302
    );
  }

  if (result.error) {
    return new Response(result.error, { status: 403 });
  }

  return Response.redirect(
    "https://download.rinawarptech.com/rinawarp-pro.vsix",
    302
  );
};