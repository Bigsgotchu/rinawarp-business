/**
 * RinaWarp Terminal Pro - Personal Unlock System
 * FULLY UNLOCKED VERSION - For personal use only
 */

export function unlockPersonalVersion() {
  // Set personal license key
  const personalLicense = btoa(
    JSON.stringify({
      tier: 'lifetime',
      issued: Date.now(),
      personal: true,
      unlimited: true,
    })
  );

  localStorage.setItem('rinawarp_license', personalLicense);

  // Set personal subscription
  const personalSubscription = JSON.stringify({
    tier: 'lifetime',
    status: 'active',
    personal: true,
    unlimited: true,
    startDate: Date.now(),
  });

  localStorage.setItem('rinawarp_subscription', personalSubscription);

  // Set personal preferences
  const personalPrefs = {
    unlocked: true,
    personal: true,
    unlimited: true,
    version: 'personal-unlocked',
    lastUnlock: Date.now(),
  };

  localStorage.setItem(
    'rinawarp_personal_prefs',
    JSON.stringify(personalPrefs)
  );

  console.log('🔓 RinaWarp Terminal Pro - PERSONAL VERSION UNLOCKED!');
  console.log('✅ All features unlocked for personal use');
  console.log('✅ No limitations or restrictions');
  console.log('✅ Lifetime access to all features');

  return true;
}

export function checkPersonalUnlockStatus() {
  const licenseKey = localStorage.getItem('rinawarp_license');
  const subscription = localStorage.getItem('rinawarp_subscription');
  const prefs = localStorage.getItem('rinawarp_personal_prefs');

  if (licenseKey) {
    try {
      const decoded = atob(licenseKey);
      const data = JSON.parse(decoded);
      if (data.personal && data.unlimited) {
        return true;
      }
    } catch (error) {
      console.error('Invalid personal license key:', error);
    }
  }

  if (subscription) {
    try {
      const sub = JSON.parse(subscription);
      if (sub.personal && sub.unlimited) {
        return true;
      }
    } catch (error) {
      console.error('Invalid personal subscription data:', error);
    }
  }

  if (prefs) {
    try {
      const prefsData = JSON.parse(prefs);
      if (prefsData.personal && prefsData.unlimited) {
        return true;
      }
    } catch (error) {
      console.error('Invalid personal preferences:', error);
    }
  }

  return false;
}

export function getPersonalUnlockInfo() {
  const isUnlocked = checkPersonalUnlockStatus();

  if (isUnlocked) {
    return {
      unlocked: true,
      version: 'personal-unlocked',
      tier: 'lifetime',
      personal: true,
      unlimited: true,
      message: 'Personal version - All features unlocked!',
    };
  } else {
    return {
      unlocked: false,
      version: 'production',
      tier: 'free',
      personal: false,
      unlimited: false,
      message: 'Production version - Limited features',
    };
  }
}

// Auto-unlock on import for personal version
if (typeof window !== 'undefined') {
  // Only auto-unlock if this is the personal version
  const isPersonalVersion =
    window.location.href.includes('personal') ||
    window.location.href.includes('unlocked') ||
    document.title.includes('Personal') ||
    document.title.includes('Unlocked');

  if (isPersonalVersion) {
    unlockPersonalVersion();
  }
}
