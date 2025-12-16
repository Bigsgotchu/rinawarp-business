/**
 * Cloudflare Pages Function for License Lookup by Email
 * Handles GET requests to find license by email
 */

export const onRequestGet = async (context) => {
  try {
    const url = new URL(context.request.url);
    const email = url.searchParams.get('email');
    const db = context.env.DB;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query database for license
    const result = await db
      .prepare('SELECT * FROM licenses WHERE email = ? ORDER BY created_at DESC LIMIT 1')
      .bind(cleanEmail)
      .first();

    if (result) {
      return new Response(
        JSON.stringify({
          email: cleanEmail,
          licenseKey: result.license_key,
          status: result.status,
          plan: result.plan,
          expires: result.expires_at,
          features: JSON.parse(result.features || '[]'),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    } else {
      return new Response(
        JSON.stringify({
          error: 'No license found for this email',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }
  } catch (error) {
    console.error('Error looking up license by email:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to lookup license',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
