/**
 * Cloudflare Pages Function for License Lookup by Email
 * Handles GET requests to find license by email with enhanced security
 */

// Input validation schemas
const EMAIL_SCHEMA = {
  type: 'string',
  pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  maxLength: 254
};

// Rate limiting store (in-memory for demo, use KV in production)
const RATE_LIMIT_STORE = new Map();

// Rate limiting configuration
const RATE_LIMITS = {
  lookup: { requests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
};

// Validate email format
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'INVALID_FORMAT', message: 'Email must be a non-empty string' };
  }
  
  const trimmed = email.trim().toLowerCase();
  
  if (!EMAIL_SCHEMA.pattern.test(trimmed)) {
    return { valid: false, error: 'INVALID_FORMAT', message: 'Email format is invalid' };
  }
  
  if (trimmed.length > EMAIL_SCHEMA.maxLength) {
    return { valid: false, error: 'INVALID_FORMAT', message: 'Email is too long' };
  }
  
  return { valid: true, email: trimmed };
}

// Rate limiting check
function checkRateLimit(ip, endpoint) {
  const now = Date.now();
  const config = RATE_LIMITS[endpoint];
  if (!config) return { allowed: true };
  
  const key = `${ip}:${endpoint}`;
  const record = RATE_LIMIT_STORE.get(key) || { count: 0, resetTime: now + config.windowMs };
  
  // Reset if window expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + config.windowMs;
  }
  
  if (record.count >= config.requests) {
    return { 
      allowed: false, 
      resetTime: record.resetTime,
      error: 'RATE_LIMITED',
      message: `Too many ${endpoint} attempts. Try again in ${Math.ceil((record.resetTime - now) / 1000)} seconds.`
    };
  }
  
  record.count++;
  RATE_LIMIT_STORE.set(key, record);
  return { allowed: true };
}

// Determine license status with grace period
function getLicenseStatus(expiresAt, now = Date.now()) {
  const expiry = new Date(expiresAt).getTime();
  
  if (now <= expiry) {
    return { status: 'active', withinGrace: false };
  }
  
  const graceExpiry = expiry + (72 * 60 * 60 * 1000); // 72 hours
  if (now <= graceExpiry) {
    return { status: 'grace_period', withinGrace: true, daysRemaining: Math.ceil((graceExpiry - now) / (24 * 60 * 60 * 1000)) };
  }
  
  return { status: 'expired', withinGrace: false };
}

export const onRequestGet = async (context) => {
  try {
    const url = new URL(context.request.url);
    const email = url.searchParams.get('email');
    const db = context.env.DB;

    // Get client IP (Cloudflare provides this)
    const clientIP = context.request.headers.get('CF-Connecting-IP') || 'unknown';

    // Input validation
    const validation = validateEmail(email);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ 
          error: validation.error,
          message: validation.message,
          timestamp: new Date().toISOString()
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check
    const rateLimit = checkRateLimit(clientIP, 'lookup');
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: rateLimit.error,
          message: rateLimit.message,
          resetTime: rateLimit.resetTime,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
          }
        }
      );
    }

    // Query database for license
    const result = await db.prepare(
      'SELECT * FROM licenses WHERE email = ? ORDER BY created_at DESC LIMIT 1'
    )
      .bind(validation.email)
      .first();

    if (result) {
      // Check license status with grace period
      const licenseStatus = getLicenseStatus(result.expires_at);
      
      const response = {
        email: validation.email,
        licenseKey: result.license_key,
        status: licenseStatus.status,
        plan: result.plan,
        expires: result.expires_at,
        features: JSON.parse(result.features || '[]'),
        timestamp: new Date().toISOString()
      };

      // Add grace period information if applicable
      if (licenseStatus.withinGrace) {
        response.gracePeriodDays = licenseStatus.daysRemaining;
        response.message = `License expired but within ${licenseStatus.daysRemaining}-day grace period. Please renew to continue full access.`;
      }

      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: 'LICENSE_NOT_FOUND',
          message: 'No license found for this email address. Please check the email or contact support if you believe this is an error.',
          timestamp: new Date().toISOString()
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error looking up license by email:', error);

    // Differentiate between network errors and validation errors
    const isNetworkError = error.name === 'TypeError' && error.message.includes('fetch');
    
    return new Response(
      JSON.stringify({
        error: isNetworkError ? 'NETWORK_ERROR' : 'INTERNAL_ERROR',
        message: isNetworkError 
          ? 'Network error while looking up license. Please check your connection and try again.'
          : 'Failed to lookup license due to internal error. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      }),
      { 
        status: isNetworkError ? 503 : 500,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};