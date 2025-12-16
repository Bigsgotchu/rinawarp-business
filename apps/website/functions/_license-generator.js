/**
 * License Generator Utility
 * Generates unique license keys for RinaWarp Terminal Pro
 */

export function generateLicenseKey(email, plan = 'professional') {
  // Create a deterministic hash based on email and timestamp
  const timestamp = Date.now();
  const baseString = `${email}:${plan}:${timestamp}`;

  // Simple hash function (in production, use crypto library)
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Create license key format: RINA-XXXX-XXXX-XXXX-XXXX
  const hexHash = Math.abs(hash).toString(16).toUpperCase();
  const paddedHash = hexHash.padStart(16, '0');

  const parts = [
    paddedHash.substring(0, 4),
    paddedHash.substring(4, 8),
    paddedHash.substring(8, 12),
    paddedHash.substring(12, 16),
  ];

  return `RINA-${parts.join('-')}`;
}

/**
 * Generate license data for database storage
 */
export function generateLicenseData(customerId, email, plan, sessionId) {
  const licenseKey = generateLicenseKey(email, plan);
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year from now

  return {
    id: `lic-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    customer_id: customerId,
    email: email.toLowerCase(),
    license_key: licenseKey,
    plan: plan,
    status: 'active',
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    stripe_session_id: sessionId,
    features: getFeaturesForPlan(plan),
  };
}

/**
 * Get features based on plan
 */
function getFeaturesForPlan(plan) {
  const baseFeatures = ['terminal-pro', 'ai-intelligence', 'voice-control'];

  switch (plan) {
    case 'student':
      return [...baseFeatures, 'community-support'];
    case 'professional':
      return [...baseFeatures, 'plugins', 'team-collaboration', 'api-access'];
    case 'enterprise':
      return [
        ...baseFeatures,
        'plugins',
        'team-collaboration',
        'api-access',
        'sso',
        'dedicated-support',
        'custom-integrations',
      ];
    default:
      return baseFeatures;
  }
}

export default { generateLicenseKey, generateLicenseData };
