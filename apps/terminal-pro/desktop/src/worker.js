function guessType(key) {
  const lower = key.toLowerCase();
  if (lower.endsWith('.blockmap')) return 'application/octet-stream';
  if (lower.endsWith('.appimage')) return 'application/octet-stream';
  if (lower.endsWith('.exe')) return 'application/octet-stream';
  if (lower.endsWith('.dmg')) return 'application/octet-stream';
  if (lower.endsWith('.zip')) return 'application/zip';
  if (lower.endsWith('.7z')) return 'application/x-7z-compressed';
  if (lower.endsWith('.tar.gz')) return 'application/gzip';
  return 'application/octet-stream';
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const key = url.pathname.replace(/^\/+/, '');
    const range = req.headers.get('Range') || undefined;

    const object = await env.R2.get(key, { range });
    if (!object) return new Response('Not found', { status: 404 });

    // Base headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Type', guessType(key));

    // Range handling
    if (object.range) {
      headers.set(
        'Content-Range',
        `bytes ${object.range.offset}-${object.range.end}/${object.size}`,
      );
      headers.set('Content-Length', String(object.range.end - object.range.offset + 1));
      if (req.method === 'HEAD') return new Response(null, { status: 206, headers });
      return new Response(object.body, { status: 206, headers });
    }

    headers.set('Content-Length', String(object.size));
    if (req.method === 'HEAD') return new Response(null, { status: 200, headers });
    return new Response(object.body, { status: 200, headers });
  },
};
