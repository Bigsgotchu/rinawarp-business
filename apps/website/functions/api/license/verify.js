/**
 * Cloudflare Pages Function for License Verification
 * Handles POST requests to verify license keys
 */

export const onRequestPost = async (context) => {
  try {
    const { licenseKey } = await context.request.json();
    const db = context.env.DB;

    if (!licenseKey) {
      return new Response(
        JSON.stringify({ error: 'License key is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Query database for license
    const result = await db.prepare(
      'SELECT * FROM licenses WHERE license_key = ? AND status = ?'
    )
      .bind(licenseKey, 'active')
      .first();

    if (result) {
      return new Response(
        JSON.stringify({
          valid: true,
          license: {
            id: result.id,
            email: result.email,
            plan: result.plan,
            status: result.status,
            expires: result.expires_at,
            features: JSON.parse(result.features || '[]'),
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Invalid or expired license key',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error verifying license:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to verify license',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};