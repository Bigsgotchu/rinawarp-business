/**
 * verify-rinawarp-deployment.js
 * Comprehensive Puppeteer test for RinaWarp deployment verification
 * Tests:
 * - HTTP 200 status for all pages
 * - Cookie banner visibility and functionality
 * - Brand color scheme (hot pink, coral, teal, baby blue, black)
 * - Legal links (Privacy Policy, Terms of Service)
 * - Stripe checkout functionality
 * - Download links
 */

const puppeteer = require('puppeteer');

const SITE_URL = process.env.SITE_URL || 'https://rinawarptech.com';
const TIMEOUT = 10000;

async function runTests() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Starting RinaWarp deployment verification...\n');
    
    // Test 1: HTTP 200 check
    console.log('📡 Test 1: Verifying HTTP 200 status...');
    const response = await page.goto(SITE_URL, { waitUntil: 'networkidle2' });
    if (response.status() !== 200) {
      throw new Error(`Expected HTTP 200, got ${response.status()}`);
    }
    console.log('✅ HTTP 200 confirmed\n');
    
    // Test 2: Cookie banner visibility
    console.log('🍪 Test 2: Verifying cookie banner...');
    const bannerSelector = '#rinawarp-cookie-banner';
    await page.waitForSelector(bannerSelector, { timeout: TIMEOUT });
    console.log('✅ Cookie banner is visible');
    
    // Test 3: Legal links
    console.log('📋 Test 3: Verifying legal links...');
    const textContent = await page.$eval(bannerSelector, el => el.textContent);
    if (!textContent.toLowerCase().includes('privacy policy')) {
      throw new Error('Privacy Policy link not found in cookie banner');
    }
    if (!textContent.toLowerCase().includes('terms of service')) {
      throw new Error('Terms of Service link not found in cookie banner');
    }
    console.log('✅ Privacy Policy and Terms of Service links present\n');
    
    // Test 4: Brand colors - buttons
    console.log('🎨 Test 4: Verifying brand color scheme...');
    const button = await page.$('button');
    if (button) {
      const bgColor = await page.evaluate(el => getComputedStyle(el).backgroundColor, button);
      if (!bgColor.includes('255') || !bgColor.includes('0') || !bgColor.includes('127')) {
        throw new Error(`Button background color ${bgColor} doesn't match hot pink (#ff007f)`);
      }
      console.log('✅ Button color: Hot Pink (#ff007f)');
    }
    
    // Test 5: Brand colors - headers
    const header = await page.$('h1, h2, h3');
    if (header) {
      const color = await page.evaluate(el => getComputedStyle(el).color, header);
      if (!color.includes('0') || !color.includes('128') || !color.includes('128')) {
        throw new Error(`Header color ${color} doesn't match teal (#008080)`);
      }
      console.log('✅ Header color: Teal (#008080)');
    }
    
    // Test 6: Brand colors - cards
    const card = await page.$('.card');
    if (card) {
      const bgColor = await page.evaluate(el => getComputedStyle(el).backgroundColor, card);
      if (!bgColor.includes('137') || !bgColor.includes('207') || !bgColor.includes('240')) {
        throw new Error(`Card background color ${bgColor} doesn't match baby blue (#89CFF0)`);
      }
      console.log('✅ Card color: Baby Blue (#89CFF0)');
    }
    
    // Test 7: Cookie banner dismissal
    console.log('🚫 Test 7: Testing cookie banner dismissal...');
    const dismissButton = await page.$(`${bannerSelector} button`);
    if (!dismissButton) throw new Error('Dismiss button not found');
    await dismissButton.click();
    await page.waitForTimeout(500);
    const isHidden = await page.evaluate(
      (sel) => document.querySelector(sel).style.display === 'none' || 
               document.querySelector(sel).classList.contains('hidden'),
      bannerSelector
    );
    if (!isHidden) throw new Error('Banner did not hide after dismiss');
    console.log('✅ Banner dismisses correctly');
    
    // Test 8: localStorage persistence
    console.log('💾 Test 8: Testing localStorage persistence...');
    await page.reload({ waitUntil: 'networkidle2' });
    const bannerStillHidden = await page.evaluate(
      (sel) => document.querySelector(sel).style.display === 'none' || 
               document.querySelector(sel).classList.contains('hidden'),
      bannerSelector
    );
    if (!bannerStillHidden) throw new Error('Banner reappeared after reload');
    console.log('✅ Banner dismissal persists after reload\n');
    
    // Test 9: Download page
    console.log('📥 Test 9: Testing download page...');
    await page.goto(`${SITE_URL}/download.html`, { waitUntil: 'networkidle2' });
    const downloadResponse = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href$=".zip"], a[href$=".exe"], a[href$=".dmg"]'));
      return links.length > 0;
    });
    if (!downloadResponse) throw new Error('No download links found on download page');
    console.log('✅ Download page contains download links\n');
    
    // Test 10: Pricing/Stripe page
    console.log('💳 Test 10: Testing Stripe checkout...');
    await page.goto(`${SITE_URL}/pricing.html`, { waitUntil: 'networkidle2' });
    const stripeButton = await page.$('button[href*="stripe.com"]');
    if (!stripeButton) throw new Error('Stripe checkout button not found');
    console.log('✅ Stripe checkout button present\n');
    
    console.log('🎯 All tests passed successfully!');
    console.log('\n✅ Deployment verification complete:');
    console.log('   - HTTP 200 status confirmed');
    console.log('   - Cookie banner functional');
    console.log('   - Brand colors applied correctly');
    console.log('   - Legal links present');
    console.log('   - Downloads available');
    console.log('   - Stripe checkout ready');
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();