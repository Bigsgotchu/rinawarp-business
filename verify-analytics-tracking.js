#!/usr/bin/env node
/**
 * Analytics Tracking Verification Script
 * 
 * This script verifies that analytics tracking is properly configured
 * and working on the RinaWarp website.
 */

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const PRODUCTION_WEBSITE_URL = 'https://www.rinawarptech.com';
const TIMEOUT = 10000; // 10 seconds

// Analytics providers to check
const ANALYTICS_PROVIDERS = [
  {
    name: 'Plausible',
    scriptPattern: /plausible\.io\/js\/plausible\.js/,
    headerPattern: /data-domain="rinawarptech\.com"/
  },
  {
    name: 'Google Analytics 4',
    scriptPattern: /gtag\(/,
    headerPattern: /ga-4/gi
  },
  {
    name: 'Cloudflare Analytics',
    scriptPattern: /cloudflare\.com\/cdn-cgi/,
    headerPattern: /cf-ray/
  }
];

// Tracked events to verify
const EXPECTED_EVENTS = [
  'pageview',
  'Checkout Click',
  'Download Click',
  'Error',
  'Unhandled Rejection'
];

let results = {
  pageLoaded: false,
  analyticsScripts: {},
  securityHeaders: {},
  trackedEvents: {},
  warnings: [],
  errors: []
};

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function checkPageLoad() {
  console.log('🔍 Checking website accessibility...');
  try {
    const response = await fetchWithTimeout(PRODUCTION_WEBSITE_URL, {
      method: 'GET'
    });
    
    if (response.ok) {
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      results.pageLoaded = true;
      console.log('✅ Website loaded successfully');
      
      // Check for analytics scripts
      checkAnalyticsScripts(html);
      
      // Check security headers
      checkSecurityHeaders(response);
      
      // Check for event tracking setup
      checkEventTracking(document);
      
      return true;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (err) {
    results.errors.push(`Failed to load page: ${err.message}`);
    console.error(`❌ ${err.message}`);
    return false;
  }
}

function checkAnalyticsScripts(html) {
  console.log('\n📊 Checking analytics scripts...');
  
  ANALYTICS_PROVIDERS.forEach(provider => {
    const scriptFound = provider.scriptPattern.test(html);
    const headerFound = provider.headerPattern.test(html);
    
    results.analyticsScripts[provider.name] = {
      scriptPresent: scriptFound,
      headerPresent: headerFound,
      status: scriptFound || headerFound ? '✅' : '❌'
    };
    
    if (scriptFound || headerFound) {
      console.log(`✅ ${provider.name}: ${scriptFound ? 'Script' : 'Header'} found`);
    } else {
      console.warn(`⚠️ ${provider.name}: Not found`);
      results.warnings.push(`${provider.name} analytics not detected`);
    }
  });
}

function checkSecurityHeaders(response) {
  console.log('\n🔒 Checking security headers...');
  
  const headers = {
    'Content-Security-Policy': response.headers.get('content-security-policy'),
    'Strict-Transport-Security': response.headers.get('strict-transport-security'),
    'X-Content-Type-Options': response.headers.get('x-content-type-options'),
    'X-Frame-Options': response.headers.get('x-frame-options')
  };
  
  Object.entries(headers).forEach(([header, value]) => {
    results.securityHeaders[header] = value ? '✅' : '❌';
    
    if (value) {
      console.log(`✅ ${header}: Present`);
    } else {
      console.warn(`⚠️ ${header}: Missing`);
      results.warnings.push(`${header} header missing`);
    }
  });
}

function checkEventTracking(document) {
  console.log('\n🎯 Checking event tracking setup...');
  
  // Check for checkout buttons
  const checkoutButtons = document.querySelectorAll('a[href*="stripe.com"], a[href*="/pricing"]');
  results.trackedEvents.checkoutButtons = checkoutButtons.length > 0 ? '✅' : '❌';
  
  if (checkoutButtons.length > 0) {
    console.log(`✅ Found ${checkoutButtons.length} checkout button(s)`);
  } else {
    console.warn('⚠️ No checkout buttons found');
    results.warnings.push('No checkout buttons found for tracking');
  }
  
  // Check for download links
  const downloadLinks = document.querySelectorAll('a[download], a[href$=".vsix"], a[href$=".exe"], a[href$=".dmg"]');
  results.trackedEvents.downloadLinks = downloadLinks.length > 0 ? '✅' : '❌';
  
  if (downloadLinks.length > 0) {
    console.log(`✅ Found ${downloadLinks.length} download link(s)`);
  } else {
    console.warn('⚠️ No download links found');
    results.warnings.push('No download links found for tracking');
  }
  
  // Check for analytics.js file
  const analyticsScript = document.querySelector('script[src*="analytics.js"]');
  results.trackedEvents.analyticsScript = analyticsScript ? '✅' : '❌';
  
  if (analyticsScript) {
    console.log('✅ Analytics script loaded');
  } else {
    console.warn('⚠️ Analytics script not found');
    results.warnings.push('Analytics script not loaded');
  }
}

async function verifyAnalyticsAPI() {
  console.log('\n🔍 Verifying analytics API endpoints...');
  
  try {
    // Check if Plausible API is accessible (if configured)
    const plausibleApi = 'https://plausible.io/api/v1/stats/aggregate';
    const response = await fetchWithTimeout(plausibleApi, {
      method: 'HEAD'
    });
    
    if (response.ok) {
      console.log('✅ Plausible API accessible');
    } else {
      console.warn('⚠️ Plausible API not accessible (may be private)');
    }
  } catch (err) {
    console.warn('⚠️ Could not verify Plausible API (expected for private instances)');
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 ANALYTICS TRACKING VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`\n🌐 Page Load: ${results.pageLoaded ? '✅ PASSED' : '❌ FAILED'}`);
  
  console.log('\n📊 Analytics Providers:');
  Object.entries(results.analyticsScripts).forEach(([provider, data]) => {
    console.log(`   ${data.status} ${provider}: ${data.scriptPresent ? 'Script' : data.headerPresent ? 'Header' : 'Not found'}`);
  });
  
  console.log('\n🔒 Security Headers:');
  Object.entries(results.securityHeaders).forEach(([header, status]) => {
    console.log(`   ${status} ${header}`);
  });
  
  console.log('\n🎯 Tracked Events:');
  console.log(`   ${results.trackedEvents.checkoutButtons} Checkout buttons`);
  console.log(`   ${results.trackedEvents.downloadLinks} Download links`);
  console.log(`   ${results.trackedEvents.analyticsScript} Analytics script`);
  
  if (results.warnings.length > 0) {
    console.log(`\n⚠️ Warnings (${results.warnings.length}):`);
    results.warnings.forEach(warning => {
      console.log(`   • ${warning}`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Errors (${results.errors.length}):`);
    results.errors.forEach(error => {
      console.log(`   • ${error}`);
    });
  }
  
  const allGood = results.pageLoaded && 
                  Object.values(results.analyticsScripts).every(s => s.status === '✅') &&
                  results.errors.length === 0;
  
  if (allGood) {
    console.log('\n✅ ANALYTICS TRACKING: ALL CHECKS PASSED');
    process.exit(0);
  } else {
    console.log('\n⚠️ ANALYTICS TRACKING: SOME ISSUES DETECTED');
    process.exit(1);
  }
}

(async () => {
  console.log('\x1b[36m[ANALYTICS VERIFICATION]\\[0m ===');
  console.log('Verifying analytics tracking for RinaWarp website\n');
  
  await checkPageLoad();
  await verifyAnalyticsAPI();
  printSummary();
})().catch(err => {
  console.error(`\n💥 UNEXPECTED ERROR: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
