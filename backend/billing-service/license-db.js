import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock database for testing - replace with real DB in production
const licenses = {};
const processedEvents = new Set();

// License database operations
export async function updateLicensePlan(licenseKey, licenseData) {
  console.log(`📝 Updating license ${licenseKey} with plan: ${licenseData.plan}`);

  licenses[licenseKey] = {
    ...licenseData,
    updatedAt: new Date().toISOString(),
    licenseKey
  };

  return licenses[licenseKey];
}

export async function getLicenseByKey(licenseKey) {
  return licenses[licenseKey] || null;
}

// Idempotency tracking
export const saveProcessedEvent = {
  check: async (eventId) => processedEvents.has(eventId),
  store: async (eventId) => {
    processedEvents.add(eventId);
    return true;
  }
};

// Mock function to simulate real database operations
export async function simulateDatabaseOperations() {
  console.log('🗄️  Database operations would go here in production');
  console.log('📊  Current licenses in memory:', Object.keys(licenses).length);
}