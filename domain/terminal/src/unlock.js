// RinaWarp Terminal Pro - Personal Unlock System
// This file ensures the application is fully unlocked for personal use

export function unlockApplication() {
  // Create a personal lifetime license key
  const personalLicense = {
    tier: 'lifetime',
    user: 'kgilley',
    type: 'personal',
    features: 'unlimited',
    issued: new Date().toISOString(),
    expires: 'never',
    signature: 'rinawarp-personal-unlock',
  };

  // Encode and store the license
  const licenseKey = btoa(JSON.stringify(personalLicense));
  localStorage.setItem('rinawarp_license', licenseKey);

  // Set unlimited subscription
  const subscription = {
    tier: 'lifetime',
    status: 'active',
    features: 'unlimited',
    startDate: new Date().toISOString(),
    endDate: 'never',
  };
  localStorage.setItem('rinawarp_subscription', JSON.stringify(subscription));

  // Set personal unlock flag
  localStorage.setItem('rinawarp_personal_unlock', 'true');

  console.log('🔓 RinaWarp Terminal Pro - PERSONAL UNLOCK ACTIVATED');
  console.log('✅ All features unlocked for personal use');
  console.log('🎉 Enjoy unlimited access to all premium features!');

  return {
    success: true,
    message: 'Application unlocked for personal use',
    tier: 'lifetime',
    features: 'unlimited',
  };
}

export function checkUnlockStatus() {
  const isUnlocked =
    localStorage.getItem('rinawarp_personal_unlock') === 'true';
  const license = localStorage.getItem('rinawarp_license');
  const subscription = localStorage.getItem('rinawarp_subscription');

  return {
    unlocked: isUnlocked,
    hasLicense: !!license,
    hasSubscription: !!subscription,
    tier: isUnlocked ? 'lifetime' : 'free',
  };
}

export function resetUnlock() {
  localStorage.removeItem('rinawarp_license');
  localStorage.removeItem('rinawarp_subscription');
  localStorage.removeItem('rinawarp_personal_unlock');
  localStorage.removeItem('rinawarp_usage');

  console.log('🔄 Unlock status reset');
}

// Auto-unlock on import
if (typeof window !== 'undefined') {
  unlockApplication();
}
