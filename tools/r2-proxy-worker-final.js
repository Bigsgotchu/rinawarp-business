export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Only allow GET and HEAD
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const path = url.pathname.replace(/^\/terminal-pro\//, '');
    const r2Url = `https://ba2f14cefa19dbdc42ff88d772410689.r2.cloudflarestorage.com/rinawarp-downloads/${path}`;

    const r2Response = await fetch(r2Url, {
      method: request.method,
      headers: {
        'Origin': request.headers.get('Origin') || '',
      }
    });

    // If not found or forbidden
    if (r2Response.status === 403 || r2Response.status === 404) {
      return new Response('File Not Found', { status: 404 });
    }

    // Cache headers
    const cacheControl =
      path.endsWith('.json') ? 'public, max-age=3600' : 'public, max-age=300';

    // Build response with CORS and security headers
    const headers = new Headers(r2Response.headers);
    headers.set('Access-Control-Allow-Origin', 'https://rinawarptech.com');
    headers.set('Cache-Control', cacheControl);
    headers.set('Content-Security-Policy', "default-src 'none'; style-src 'self';");
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('X-Content-Type-Options', 'nosniff');

    return new Response(r2Response.body, {
      status: r2Response.status,
      headers,
    });
  },
};