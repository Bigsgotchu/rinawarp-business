export default {
  async fetch(request) {
    // Configuration
    const R2_BUCKET_URL = 'https://rinawarp-downloads.r2.cloudflarestorage.com';
    const ALLOWED_METHODS = ['GET', 'HEAD'];

    // Extract path from the request URL
    const url = new URL(request.url);
    const path = url.pathname;

    // Security: Only allow GET and HEAD methods
    if (!ALLOWED_METHODS.includes(request.method)) {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { 'Allow': ALLOWED_METHODS.join(', ') }
      });
    }

    // Security: Block access to sensitive paths
    if (path.startsWith('/.well-known/') || path.startsWith('/.git/')) {
      return new Response('Access Denied', { status: 403 });
    }

    // Construct the target R2 URL
    const targetUrl = `${R2_BUCKET_URL}${path}`;

    try {
      // Forward the request to R2
      const r2Response = await fetch(targetUrl, {
        method: request.method,
        headers: cleanHeaders(request.headers)
      });

      // If R2 returns 404, return a friendly 404
      if (r2Response.status === 404) {
        return new Response('File not found', {
          status: 404,
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      // If R2 returns an error, propagate it
      if (!r2Response.ok) {
        return new Response(`R2 Error: ${r2Response.statusText}`, {
          status: r2Response.status,
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      // Clone the response to modify headers
      const response = new Response(r2Response.body, r2Response);

      // Set caching headers for better performance
      setCacheHeaders(response.headers, path);

      // Set CORS headers
      setCorsHeaders(response.headers);

      // Set security headers
      setSecurityHeaders(response.headers);

      return response;

    } catch (error) {
      console.error('R2 Proxy Error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};

// Helper functions
function cleanHeaders(headers) {
  const cleaned = new Headers();
  const allowedHeaders = ['accept', 'accept-encoding', 'accept-language', 'range', 'user-agent'];

  for (const [key, value] of headers.entries()) {
    if (allowedHeaders.includes(key.toLowerCase())) {
      cleaned.set(key, value);
    }
  }

  return cleaned;
}

function setCacheHeaders(headers, path) {
  const CACHE_TTL = 3600; // 1 hour cache for manifest files

  if (path.includes('manifest.json')) {
    headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`);
  }
  else if (path.includes('.exe') || path.includes('.zip') ||
           path.includes('.AppImage') || path.includes('.deb')) {
    headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  }
  else {
    headers.set('Cache-Control', 'public, max-age=60'); // 1 minute
  }
}

function setCorsHeaders(headers) {
  headers.set('Access-Control-Allow-Origin', 'https://rinawarptech.com');
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Range');
  headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
}

function setSecurityHeaders(headers) {
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
}