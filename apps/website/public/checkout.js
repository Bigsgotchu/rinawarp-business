// RinaWarp Stripe Checkout Integration
// Fixed version with proper plan key mapping and Stripe.js integration

console.log("✅ RinaWarp checkout script loaded successfully");

// ===== CONFIG =====

// 1) Stripe publishable key
// Prefer setting via global var in analytics-config.js like:
//   window.RINA_STRIPE_PUBLISHABLE_KEY = "pk_live_xxx";
const STRIPE_PUBLISHABLE_KEY = window.RINA_STRIPE_PUBLISHABLE_KEY || "pk_live_REPLACE_ME";

// 2) Plan keys must match your backend + RINA_PRICE_MAP keys
// Example RINA_PRICE_MAP in Cloudflare Pages:
// {
//   "terminal_pro_starter": "price_xxx",
//   "terminal_pro_creator": "price_yyy",
//   "terminal_pro_pro": "price_zzz",
//   "terminal_pro_enterprise": "price_aaa"
// }
const PLAN_KEYS = {
  student: "terminal_pro_starter",
  professional: "terminal_pro_creator", 
  pro: "terminal_pro_pro",
  enterprise: "terminal_pro_enterprise"
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

async function createCheckoutSession(planKey) {
  const body = {
    plan: planKey,
    successUrl: getSuccessUrl(),
    cancelUrl: getCancelUrl()
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

  if (!data.id && !data.sessionId) {
    throw new Error("Invalid response from checkout API");
  }

  return data.sessionId || data.id;
}

async function handleCheckoutClick(evt) {
  evt.preventDefault();
  const btn = evt.currentTarget;

  if (!stripe) {
    alert("Stripe is not configured yet. Please try again later.");
    return;
  }

  const plan = btn.dataset.plan;          // e.g. "student", "professional"
  const planKey = PLAN_KEYS[plan];

  if (!planKey) {
    console.error("❌ Unknown plan:", plan);
    alert("Unknown plan selected, please contact support.");
    return;
  }

  btn.disabled = true;
  btn.classList.add("loading");

  try {
    const sessionId = await createCheckoutSession(planKey);
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error("❌ Stripe redirect error:", error);
      alert(error.message || "Error redirecting to checkout.");
    }
  } catch (err) {
    console.error("❌ Checkout error:", err);
    alert("We couldn't start your checkout. Please try again or contact support.");
  } finally {
    btn.disabled = false;
    btn.classList.remove("loading");
  }
}

// ===== WIRE UP BUTTONS =====

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("[data-checkout-button][data-plan]");
  if (!buttons.length) {
    console.warn("⚠️ No checkout buttons found with [data-checkout-button][data-plan]");
    return;
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", handleCheckoutClick);
  });

  console.log("✅ Checkout buttons wired:", buttons.length);
});
