import type { PagesFunction } from "https://deno.land/x/wrangler@v3/types.d.ts";

export const onRequestGet: PagesFunction = async () => {
  return new Response(
    JSON.stringify({
      status: "ok",
      service: "rinawarp-api",
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};
