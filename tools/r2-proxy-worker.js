export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const prefix = "/terminal-pro/";

    if (!url.pathname.startsWith(prefix)) {
      return new Response("Invalid path", { status: 400 });
    }

    // Keep the full path including terminal-pro/ for the object key
    const objectKey = url.pathname.slice(1); // Remove leading slash only

    // Extract client information for logging
    const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const country = request.headers.get("cf-ipcountry") || "unknown";
    const referer = request.headers.get("referer") || "direct";

    // Log download event to Cloudflare Logs
    console.log(`[Download] ${objectKey} from ${clientIp} (${country}) - User-Agent: ${userAgent}`);

    try {
      const object = await env.BUCKET.get(objectKey);

      if (!object) {
        console.log(`[404] File not found: ${objectKey} - Requested by ${clientIp}`);
        return new Response("File not found", { status: 404 });
      }

      // Log successful download with file size
      const fileSize = object.size || object.body?.length || "unknown";
      console.log(`[200] Successfully served: ${objectKey} (${fileSize} bytes) to ${clientIp}`);

      // Optional: Send to webhook for analytics (uncomment to enable)
      /*
      try {
        const webhookUrl = env.WEBHOOK_URL || "https://your-logging-endpoint.com/downloads";
        await fetch(webhookUrl, {
          method: "POST",
          body: JSON.stringify({
            event: "download",
            file: objectKey,
            ip: clientIp,
            country: country,
            userAgent: userAgent,
            referer: referer,
            fileSize: fileSize,
            timestamp: new Date().toISOString()
          }),
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.WEBHOOK_SECRET || ''}`
          },
          timeout: 2000 // Don't block response for analytics
        });
      } catch (webhookError) {
        console.log(`[Webhook Error] Failed to send analytics: ${webhookError.message}`);
      }
      */

      return new Response(object.body, {
        status: 200,
        headers: {
          "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "https://rinawarptech.com",
          "X-Content-Type-Options": "nosniff",
          "X-RinaWarp-Download": "true",
          "X-RinaWarp-Version": "0.9.0"
        }
      });

    } catch (err) {
      console.log(`[500] R2 error for ${objectKey}: ${err.message} - Client: ${clientIp}`);
      return new Response(`R2 error: ${err.message}`, { status: 500 });
    }
  }
};