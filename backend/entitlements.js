/**
 * RinaWarp Terminal Pro - Entitlement Truth Table
 *
 * This is the final gate between money and features.
 * Do not modify without careful consideration of pricing power.
 */

function entitlementsFromTier(tier) {
  switch (tier) {
    case 'free':
      return {
        agent: false,
        ai: false,
        voice: false,
        terminal: true,
        memory: false,
        automation: false,
        modules: false,
        priority_support: false,
      };

    case 'basic':
      return {
        agent: 'basic',
        ai: 'limited',
        voice: false,
        terminal: true,
        memory: true,
        automation: false,
        modules: false,
        priority_support: false,
      };

    case 'starter':
      return {
        agent: 'pro',
        ai: 'medium',
        voice: false,
        terminal: true,
        memory: true,
        automation: 'basic',
        modules: false,
        priority_support: false,
      };

    case 'creator':
      return {
        agent: 'fast',
        ai: 'high',
        voice: true,
        terminal: true,
        memory: true,
        automation: 'advanced',
        modules: true,
        priority_support: false,
      };

    case 'pro':
      return {
        agent: 'unlimited',
        ai: 'unlimited',
        voice: true,
        terminal: true,
        memory: true,
        automation: 'full',
        modules: true,
        priority_support: true,
      };

    case 'founder_lifetime':
    case 'pioneer_lifetime':
    case 'evergreen_lifetime':
      return {
        agent: 'unlimited',
        ai: 'included',
        voice: true,
        terminal: true,
        memory: true,
        automation: 'full',
        modules: true,
        priority_support: tier === 'founder_lifetime' || tier === 'pioneer_lifetime',
      };

    default:
      // Unknown tier - default to free
      return {
        agent: false,
        ai: false,
        voice: false,
        terminal: true,
        memory: false,
        automation: false,
        modules: false,
        priority_support: false,
      };
  }
}

/**
 * Validate license key format and extract tier
 */
function validateLicenseKey(licenseKey) {
  // Expected format: RWTP1-{TIER}-{EMAIL}-{TIMESTAMP}
  const pattern = /^RWTP1-(.+)-(.+)-(\d+)$/;
  const match = licenseKey.match(pattern);

  if (!match) {
    return { valid: false, tier: null };
  }

  const [, tier, email, timestamp] = match;

  // Validate tier is known
  const validTiers = [
    'free',
    'basic',
    'starter',
    'creator',
    'pro',
    'founder_lifetime',
    'pioneer_lifetime',
    'evergreen_lifetime',
  ];
  if (!validTiers.includes(tier)) {
    return { valid: false, tier: null };
  }

  return {
    valid: true,
    tier,
    email,
    timestamp: parseInt(timestamp),
    entitlements: entitlementsFromTier(tier),
  };
}

/**
 * Get pricing power justification
 */
function getPricingJustification(tier) {
  switch (tier) {
    case 'basic':
      return 'Local terminal + persistent memory + limited AI agent';
    case 'starter':
      return 'Basic + advanced agent modes + medium AI usage + basic automation';
    case 'creator':
      return 'Starter + voice AI + faster reasoning + higher limits + more modules';
    case 'pro':
      return 'Creator + unlimited AI agent + full automation suite + all modules + priority support';
    case 'founder_lifetime':
    case 'pioneer_lifetime':
    case 'evergreen_lifetime':
      return 'Pro + lifetime license + no recurring fees + full access forever';
    default:
      return 'Free tier with basic terminal functionality';
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    entitlementsFromTier,
    validateLicenseKey,
    getPricingJustification,
  };
}

// Export for browser
if (typeof window !== 'undefined') {
  window.RinaWarpEntitlements = {
    entitlementsFromTier,
    validateLicenseKey,
    getPricingJustification,
  };
}
