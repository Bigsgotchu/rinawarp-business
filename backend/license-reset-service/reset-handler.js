import crypto from 'crypto';
import { processLicenseEvent, getLicenseStatus } from '../license-abuse-service/abuse-detector.js';

// In-memory storage for reset tokens (replace with database in production)
const resetTokens = new Map(); // token -> { licenseKeyHash, expiresAt, used }

// Configuration
const TOKEN_TTL_MINUTES = 15;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

/**
 * Privacy-safe hashing function
 */
function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate secure reset token
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create reset token for license
 */
export async function createResetToken(licenseKey, deviceId, email = null) {
  const licenseKeyHash = hashData(licenseKey);

  // Check if license exists and is quarantined
  const licenseStatus = getLicenseStatus(licenseKey);
  if (!licenseStatus.quarantined && licenseStatus.abuseScore < 5) {
    throw new Error('License is not eligible for reset');
  }

  // Generate token
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  // Store token
  resetTokens.set(token, {
    licenseKeyHash,
    deviceHash: hashData(deviceId),
    email: email ? hashData(email) : null,
    expiresAt: expiresAt.toISOString(),
    used: false,
  });

  // Send Slack notification
  await sendSlackNotification('reset_requested', licenseKeyHash, email);

  return {
    token,
    expiresAt: expiresAt.toISOString(),
    ttlMinutes: TOKEN_TTL_MINUTES,
  };
}

/**
 * Confirm and execute license reset
 */
export async function confirmReset(resetToken, deviceId) {
  const tokenData = resetTokens.get(resetToken);

  if (!tokenData) {
    throw new Error('Invalid or expired reset token');
  }

  // Check expiration
  if (new Date(tokenData.expiresAt) < new Date()) {
    resetTokens.delete(resetToken);
    throw new Error('Reset token has expired');
  }

  // Check if already used
  if (tokenData.used) {
    throw new Error('Reset token has already been used');
  }

  // Verify device matches (security check)
  const currentDeviceHash = hashData(deviceId);
  if (currentDeviceHash !== tokenData.deviceHash) {
    throw new Error('Device mismatch - reset token is device-specific');
  }

  try {
    // Mark token as used
    tokenData.used = true;
    tokenData.usedAt = new Date().toISOString();

    // Execute license reset
    // In a real implementation, you would:
    // 1. Clear device bindings for this license
    // 2. Reset abuse score
    // 3. Remove from quarantine

    // For now, we'll simulate by creating a "reset" event and clearing state
    await processLicenseEvent(
      'RESET-LICENSE-' + tokenData.licenseKeyHash, // Special marker
      deviceId,
      '127.0.0.1', // Reset source
      'valid',
    );

    // Send Slack notification
    await sendSlackNotification('reset_completed', tokenData.licenseKeyHash, tokenData.email);

    // Clean up used token
    resetTokens.delete(resetToken);

    return {
      success: true,
      message: 'License reset completed successfully',
      licenseKeyHash: tokenData.licenseKeyHash,
    };
  } catch (error) {
    console.error('License reset failed:', error);
    throw new Error('Failed to execute license reset');
  }
}

/**
 * Send Slack notification
 */
async function sendSlackNotification(type, licenseKeyHash, emailHash) {
  if (!SLACK_WEBHOOK_URL) {
    console.log('⚠️ Slack webhook URL not configured, skipping notification');
    return;
  }

  try {
    let message;
    switch (type) {
      case 'reset_requested':
        message = `🔑 License reset requested\nLicense: \`${licenseKeyHash.substring(0, 8)}...\`\nEmail: ${emailHash ? `${emailHash.substring(0, 8)}...` : 'not provided'}\nToken TTL: ${TOKEN_TTL_MINUTES} minutes`;
        break;
      case 'reset_completed':
        message = `✅ License reset completed\nLicense: \`${licenseKeyHash.substring(0, 8)}...\`\nDevice: ${emailHash ? 'verified' : 'unverified'}`;
        break;
      default:
        message = `License reset event: ${type}\nLicense: \`${licenseKeyHash.substring(0, 8)}...\``;
    }

    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

/**
 * Clean up expired tokens periodically
 */
export function cleanupExpiredTokens() {
  const now = new Date();
  let cleaned = 0;

  for (const [token, data] of resetTokens.entries()) {
    if (new Date(data.expiresAt) < now || data.used) {
      resetTokens.delete(token);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired/used reset tokens`);
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupExpiredTokens, 10 * 60 * 1000);
