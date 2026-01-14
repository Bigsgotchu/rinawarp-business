/**
 * verify-rinawarp-smoke.js
 * Puppeteer smoke test for RinaWarp website
 */

const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const SITE_URL = process.env.SITE_URL || "https://www.rinawarptech.com";
  const LOG_FILE = "smoke-test-log.txt";
  const SCREENSHOT_FILE = "failure-screenshot.png";

  // Clean up old logs/screenshot
  if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
  if (fs.existsSync(SCREENSHOT_FILE)) fs.unlinkSync(SCREENSHOT_FILE);

  const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + "\n");
  };

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    log(`🌐 Navigating to ${SITE_URL}`);
    await page.goto(SITE_URL, { waitUntil: "networkidle2", timeout: 30000 });

    // ---------- Test 1: Cookie Banner ----------
    log("🧾 Checking cookie banner...");
    const bannerSelector = "#rinawarp-cookie-banner";
    await page.waitForSelector(bannerSelector, { visible: true, timeout: 5000 });
    log("✅ Cookie banner visible");

    // Dismiss banner and check persistence
    const dismissSelector = "#rinawarp-cookie-banner button.dismiss";
    await page.click(dismissSelector);
    log("✅ Cookie banner dismissed");
    await page.reload({ waitUntil: "networkidle2" });
    const bannerHidden = await page.$eval(bannerSelector, el => el.style.display === "none" || el.style.visibility === "hidden");
    if (!bannerHidden) throw new Error("Cookie banner did not persist dismissal");

    log("✅ Cookie banner dismissal persisted");

    // ---------- Test 2: Download Links ----------
    log("📥 Checking download links...");
    const downloadLinks = await page.$$eval("a.download-link", links => links.map(a => a.href));
    if (downloadLinks.length === 0) throw new Error("No download links found");
    log(`✅ Found ${downloadLinks.length} download links`);

    // Check HTTP status of first download link
    const downloadResponse = await page.goto(downloadLinks[0]);
    if (downloadResponse.status() !== 200) throw new Error(`Download link returned status ${downloadResponse.status()}`);
    log("✅ Download link works (HTTP 200)");

    // ---------- Test 3: Stripe Checkout ----------
    log("💳 Checking Stripe checkout button...");
    const stripeBtn = await page.$("a.stripe-checkout");
    if (!stripeBtn) throw new Error("Stripe checkout button not found");
    await stripeBtn.click();
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 });
    if (!page.url().includes("stripe.com")) throw new Error("Did not navigate to Stripe checkout page");
    log("✅ Stripe checkout page reachable");

    // ---------- Test 4: Multiple Pages ----------
    log("📄 Checking multiple pages...");
    const pageLinks = await page.$$eval("a.nav-link", links => links.map(a => a.href));
    for (const link of pageLinks) {
      await page.goto(link, { waitUntil: "networkidle2", timeout: 15000 });
      const status = await page.evaluate(() => document.readyState);
      if (status !== "complete") throw new Error(`Page ${link} did not load completely`);
      log(`✅ Page loaded: ${link}`);
    }

    log("🎯 All smoke tests passed successfully!");

  } catch (err) {
    log(`❌ Smoke test failed: ${err.message}`);
    await page.screenshot({ path: SCREENSHOT_FILE, fullPage: true });
    log(`📸 Screenshot saved: ${SCREENSHOT_FILE}`);
    await browser.close();
    process.exit(1);
  }

  await browser.close();
  process.exit(0);
})();
