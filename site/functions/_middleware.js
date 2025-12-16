// Protect /admin.html with HTTP Basic Auth using env.BASIC_AUTH = "user:pass" (set as a secret).
export const onRequest = async ({ request, env, next }) => {
  const url = new URL(request.url);

  // Only gate the admin page (keep APIs public)
  if (url.pathname !== '/admin.html') {
    return next();
  }

  const realm = 'RinaWarp Admin';
  const unauthorized = () =>
    new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"` },
    });

  const cred = env.BASIC_AUTH || ''; // "user:pass"
  if (!cred.includes(':')) return unauthorized();

  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Basic ')) return unauthorized();

  try {
    const decoded = atob(auth.slice(6));
    if (decoded === cred) return next();
  } catch (_) {
    /* ignore */
  }

  return unauthorized();
};
