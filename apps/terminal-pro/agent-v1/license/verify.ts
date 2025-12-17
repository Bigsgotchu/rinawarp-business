import crypto from 'node:crypto';
import type { License, LicenseValidationResult, LicenseTier } from './types';

/**
 * Verify license signature locally (offline-capable)
 * Uses HMAC-SHA256 with a public secret for tamper resistance
 */
export function verifyLicense(license: License, publicSecret: string): LicenseValidationResult {
  try {
    // Extract signature and payload
    const { signature, ...payload } = license;

    // Validate required fields
    if (!payload.tier || !payload.email || !payload.issuedAt) {
      return {
        valid: false,
        error: 'Missing required license fields',
      };
    }

    // Validate tier
    const validTiers: LicenseTier[] = [
      'starter',
      'creator',
      'pro',
      'pioneer',
      'founder',
      'enterprise',
    ];
    if (!validTiers.includes(payload.tier)) {
      return {
        valid: false,
        error: 'Invalid license tier',
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return {
        valid: false,
        error: 'Invalid email format',
      };
    }

    // Validate issued date
    const issuedDate = new Date(payload.issuedAt);
    if (isNaN(issuedDate.getTime())) {
      return {
        valid: false,
        error: 'Invalid issued date',
      };
    }

    // Check expiration if present
    if (payload.expiresAt) {
      const expiryDate = new Date(payload.expiresAt);
      if (isNaN(expiryDate.getTime())) {
        return {
          valid: false,
          error: 'Invalid expiry date',
        };
      }

      if (expiryDate < new Date()) {
        return {
          valid: false,
          tier: payload.tier,
          expiresAt: payload.expiresAt,
          error: 'License has expired',
        };
      }
    }

    // Verify cryptographic signature
    const expectedSignature = crypto
      .createHmac('sha256', publicSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (expectedSignature !== signature) {
      return {
        valid: false,
        error: 'Invalid license signature',
      };
    }

    return {
      valid: true,
      tier: payload.tier,
      expiresAt: payload.expiresAt,
    };
  } catch (error) {
    return {
      valid: false,
      error: 'License verification failed',
    };
  }
}

/**
 * Get tier priority for feature gating
 * Higher numbers = more features
 */
export function getTierPriority(tier: LicenseTier): number {
  const priorities = {
    starter: 1,
    creator: 2,
    pro: 3,
    pioneer: 4,
    founder: 5,
    enterprise: 6,
  };

  return priorities[tier];
}

/**
 * Check if a tier has access to a feature requiring minimum tier
 */
export function hasTierAccess(userTier: LicenseTier, requiredTier: LicenseTier): boolean {
  return getTierPriority(userTier) >= getTierPriority(requiredTier);
}
