/**
 * Cloudflare Pages Function for License Verification
 * Handles POST requests to verify license keys with enhanced security
 */

// Input validation schemas
const LICENSE_KEY_SCHEMA = {
  type: 'string',
  pattern: '^[A-Z0-9-]{10,100}$',
  minLength: 10,
  maxLength: 100
};

// Rate limiting store (in-memory for demo, use KV in production)
const RATE_LIMIT_STORE = new Map();

// Rate limiting configuration
const RATE_LIMITS = {
  verify: { requests: 5, windowMs: 60 * 1000 }, // 5 requests per minute
  activate: { requests: 3, windowMs: 5 * 60 * 1000 }, // 3 activations per 5 minutes
};

// Grace period configuration (72 hours)
const GRACE_PERIOD_MS = 72 * 60 * 60 * 1000;

// Validate license key format
function validateLicenseKey(licenseKey) {
  if (!licenseKey || typeof licenseKey !== 'string') {
    return { valid: false, error: 'INVALID_FORMAT', message: 'License key must be a non-empty string' };
  }
  
  const trimmed = licenseKey.trim().toUpperCase();
  
  if (!LICENSE_KEY_SCHEMA.pattern.test(trimmed)) {
    return { valid: false, error: 'INVALID_FORMAT', message: 'License key format is invalid. Must contain only uppercase letters, numbers, and hyphens (10-100 characters)' };
  }
  
  return { valid: true, key: trimmed };
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
  
  const graceExpiry = expiry + GRACE_PERIOD_MS;
  if (now <= graceExpiry) {
    return { status: 'grace_period', withinGrace: true, daysRemaining: Math.ceil((graceExpiry - now) / (24 * 60 * 60 * 1000)) };
  }
  
  return { status: 'expired', withinGrace: false };
}

export const onRequestPost = async (context) => {
  try {
    // Get client IP (Cloudflare provides this)
    const clientIP = context.request.headers.get('CF-Connecting-IP') || 'unknown';
    const requestData = await context.request.json();
    const { licenseKey } = requestData;
    const db = context.env.DB;

    // Input validation
    const validation = validateLicenseKey(licenseKey);
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
    const rateLimit = checkRateLimit(clientIP, 'verify');
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
      'SELECT * FROM licenses WHERE license_key = ? AND status = ?'
    )
      .bind(validation.key, 'active')
      .first();

    if (result) {
      // Check license status with grace period
      const licenseStatus = getLicenseStatus(result.expires_at);
      
      const response = {
        valid: licenseStatus.status !== 'expired',
        license: {
          id: result.id,
          email: result.email,
          plan: result.plan,
          status: licenseStatus.status,
          expires: result.expires_at,
          features: JSON.parse(result.features || '[]'),
        },
        timestamp: new Date().toISOString()
      };

      // Add grace period information if applicable
      if (licenseStatus.withinGrace) {
        response.license.gracePeriodDays = licenseStatus.daysRemaining;
        response.license.message = `License expired but within ${licenseStatus.daysRemaining}-day grace period. Please renew to continue full access.`;
      }

      const statusCode = licenseStatus.status === 'expired' ? 401 : 200;
      
      return new Response(
        JSON.stringify(response),
        { status: statusCode, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'INVALID_LICENSE',
          message: 'License key not found or not active. Please check your license key or contact support.',
          timestamp: new Date().toISOString()
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error verifying license:', error);

    // Differentiate between network errors and validation errors
    const isNetworkError = error.name === 'TypeError' && error.message.includes('fetch');
    
    return new Response(
      JSON.stringify({
        error: isNetworkError ? 'NETWORK_ERROR' : 'INTERNAL_ERROR',
        message: isNetworkError 
          ? 'Network error while verifying license. Please check your connection and try again.'
          : 'Failed to verify license due to internal error. Please try again later.',
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