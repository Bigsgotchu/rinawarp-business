// RinaWarp Stripe Checkout Integration - Updated for pricing.json single source of truth
// Drop this once on /pricing pages for zero hardcoded prices

console.log("✅ RinaWarp checkout script loaded successfully");

// ===== CONFIG =====

// Stripe publishable key - set via global var in analytics-config.js
const STRIPE_PUBLISHABLE_KEY = window.RINA_STRIPE_PUBLISHABLE_KEY || "pk_live_REPLACE_ME";

// Plan keys must match your backend + pricing.json keys
// These map to the backend API expectations (checkout-v2.js)
const PLAN_KEYS = {
  // Direct mappings to backend API plan keys
  basic: "basic-monthly",
  starter: "starter-monthly", 
  creator: "creator-monthly",
  pro: "pro-monthly",
  founder_lifetime: "founder-lifetime",
  pioneer_lifetime: "pioneer-lifetime",
  evergreen_lifetime: "evergreen-lifetime"
};

// ===== INIT STRIPE =====

if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.includes("REPLACE_ME")) {
  console.error("❌ Stripe publishable key is not configured. Set window.RINA_STRIPE_PUBLISHABLE_KEY.");
}

const stripe = STRIPE_PUBLISHABLE_KEY ? window.Stripe(STRIPE_PUBLISHABLE_KEY) : null;

// ===== HELPERS =====

function getBaseUrl() {
  return window.location.origin.replace(/\/+$/, "");
}

function getSuccessUrl() {
  return getBaseUrl() + "/success.html";
}

function getCancelUrl() {
  return getBaseUrl() + "/cancel.html";
}

async function loadPricing() {
  try {
    const res = await fetch('/pricing.json');
    if (!res.ok) throw new Error('Failed to load pricing data');
    return await res.json();
  } catch (error) {
    console.error('❌ Failed to load pricing.json:', error);
    return null;
  }
}

async function createCheckoutSession(planKey) {
  const pricing = await loadPricing();
  const plan = pricing?.plans?.[planKey.replace('-monthly', '').replace('-lifetime', '')];
  
  if (!plan || !plan.stripe_price_id) {
    throw new Error(`Plan not found or missing stripe_price_id: ${planKey}`);
  }

  const body = {
    plan: planKey,
    successUrl: getSuccessUrl(),
    cancelUrl: getCancelUrl(),
    email: window.localStorage.getItem('rina_email') || null
  };

  console.log("🧾 Creating checkout session with body:", body);

  const res = await fetch("/api/checkout-v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Failed to create checkout session:", res.status, text);
    throw new Error("Checkout API error: " + res.status);
  }

  const data = await res.json();
  console.log("✅ Received checkout session:", data);

  if (!data.sessionId) {
    throw new Error("Invalid response from checkout API");
  }

  return data.sessionId;
}

async function handleCheckoutClick(evt) {
  evt.preventDefault();
  const btn = evt.currentTarget;

  if (!stripe) {
    alert("Stripe is not configured yet. Please try again later.");
    return;
  }

  const plan = btn.dataset.checkout;
  const planKey = PLAN_KEYS[plan];

  if (!planKey) {
    console.error("❌ Unknown plan:", plan);
    alert("Unknown plan selected, please contact support.");
    return;
  }

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Processing...';

  try {
    // Capture email if not already stored
    let email = window.localStorage.getItem('rina_email');
    if (!email) {
      email = prompt('Please enter your email for checkout:');
      if (!email) {
        throw new Error('Email required for checkout');
      }
      window.localStorage.setItem('rina_email', email);
    }

    const sessionId = await createCheckoutSession(planKey);
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error("❌ Stripe redirect error:", error);
      alert(error.message || "Error redirecting to checkout.");
    }
  } catch (err) {
    console.error("❌ Checkout error:", err);
    alert(err.message || "We couldn't start your checkout. Please try again or contact support.");
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

// ===== WIRE UP BUTTONS =====

document.addEventListener("DOMContentLoaded", async () => {
  // Load pricing data to validate plan keys
  const pricing = await loadPricing();
  if (pricing) {
    console.log("✅ Pricing data loaded:", Object.keys(pricing.plans));
  }

  const buttons = document.querySelectorAll("[data-checkout]");
  if (!buttons.length) {
    console.warn("⚠️ No checkout buttons found with [data-checkout]");
    return;
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", handleCheckoutClick);
    // Store original text for restoration
    btn.dataset.originalText = btn.textContent;
  });

  console.log("✅ Checkout buttons wired:", buttons.length);
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadPricing,
    PLAN_KEYS,
    createCheckoutSession
  };
}
