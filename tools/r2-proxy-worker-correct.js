export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Enforce only GET and HEAD methods
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Get the file path *after* "/terminal-pro/"
    const prefix = '/terminal-pro/';
    if (!url.pathname.startsWith(prefix)) {
      return new Response('Bad Request', { status: 400 });
    }

    const objectPath = url.pathname.slice(prefix.length); // everything after /terminal-pro/
    const r2Url = `https://ba2f14cefa19dbdc42ff88d772410689.r2.cloudflarestorage.com/rinawarp-downloads/${objectPath}`;

    const r2Response = await fetch(r2Url, {
      method: request.method,
    });

    if (!r2Response.ok) {
      return new Response('File not found', { status: r2Response.status });
    }

    const headers = new Headers(r2Response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', objectPath.endsWith('.json')
      ? 'public, max-age=3600'
      : 'public, max-age=300');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Content-Security-Policy', "default-src 'none'; style-src 'self' 'unsafe-inline';");

    return new Response(r2Response.body, {
      status: 200,
      headers,
    });
  },
};