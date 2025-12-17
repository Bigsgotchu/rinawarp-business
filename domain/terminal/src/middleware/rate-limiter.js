/**
 * Advanced Rate Limiting Middleware
 * Tier-based rate limiting with subscription support
 */

import { RateLimiterMemory } from 'rate-limiter-flexible';

// Store rate limiters by tier
const rateLimiters = {};

// Rate limiting configuration by subscription tier
const RATE_LIMIT_CONFIG = {
  free: {
    points: 10, // 10 requests
    duration: 60, // per minute
    blockDuration: 60, // block for 1 minute
  },
  professional: {
    points: 100, // 100 requests
    duration: 60, // per minute
    blockDuration: 30, // block for 30 seconds
  },
  business: {
    points: 500, // 500 requests
    duration: 60, // per minute
    blockDuration: 15, // block for 15 seconds
  },
  lifetime: {
    points: 1000, // 1000 requests
    duration: 60, // per minute
    blockDuration: 5, // block for 5 seconds
  },
};

// Initialize rate limiters
function initializeRateLimiters() {
  Object.keys(RATE_LIMIT_CONFIG).forEach((tier) => {
    const config = RATE_LIMIT_CONFIG[tier];
    rateLimiters[tier] = new RateLimiterMemory({
      keyPrefix: `rate_limit_${tier}`,
      points: config.points,
      duration: config.duration,
      blockDuration: config.blockDuration,
    });
  });

  console.log('✅ Rate limiters initialized for all tiers');
}

// Initialize on module load
initializeRateLimiters();

/**
 * Rate limiting middleware
 * @param {string} tier - Subscription tier (free, professional, business, lifetime)
 * @returns {Function} Express middleware function
 */
export function createRateLimiter(tier = 'free') {
  return async (req, res, next) => {
    const limiter = rateLimiters[tier];

    if (!limiter) {
      console.warn(`⚠️ No rate limiter found for tier: ${tier}`);
      return next();
    }

    // Use IP address as key (in production, use user ID if authenticated)
    const key = req.ip || req.connection.remoteAddress || 'unknown';

    try {
      await limiter.consume(key);
      next();
    } catch (error) {
      if (error instanceof Error) {
        const retryAfter = Math.ceil(error.msBeforeNext / 1000) || 1;

        res.set('Retry-After', String(retryAfter));
        res.set('X-RateLimit-Limit', String(RATE_LIMIT_CONFIG[tier].points));
        res.set('X-RateLimit-Remaining', '0');
        res.set('X-RateLimit-Reset', String(Date.now() + error.msBeforeNext));

        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded for ${tier} tier. Please retry in ${retryAfter} seconds.`,
          retryAfter,
          tier,
          upgradeUrl: tier === 'free' ? '/pricing' : null,
        });
      }

      console.error('Rate limiting error:', error);
      return res.status(500).json({ error: 'Rate limiting error' });
    }
  };
}

/**
 * Get rate limit info for a specific tier and key
 * @param {string} tier - Subscription tier
 * @param {string} key - User/IP key
 * @returns {Object} Rate limit information
 */
export async function getRateLimitInfo(tier, key) {
  const limiter = rateLimiters[tier];

  if (!limiter) {
    return null;
  }

  try {
    const info = await limiter.get(key);
    const config = RATE_LIMIT_CONFIG[tier];

    return {
      tier,
      limit: config.points,
      remaining: Math.max(0, config.points - (info?.totalHits || 0)),
      resetTime: info?.msBeforeNext || 0,
      blocked: info?.blocked || false,
    };
  } catch (error) {
    console.error('Error getting rate limit info:', error);
    return null;
  }
}

/**
 * Middleware to automatically determine tier from user subscription
 * Requires user authentication middleware to run first
 */
export function adaptiveRateLimiter(req, res, next) {
  // Get user tier from request (set by auth middleware)
  const userTier = req.user?.subscription?.tier || 'free';

  // Apply appropriate rate limiter
  const rateLimiter = createRateLimiter(userTier);
  return rateLimiter(req, res, next);
}

export default {
  createRateLimiter,
  getRateLimitInfo,
  adaptiveRateLimiter,
  RATE_LIMIT_CONFIG,
};
