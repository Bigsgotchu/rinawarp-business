/**
 * RinaWarp Stripe Links Configuration
 * Single source of truth for plan → Stripe checkout links
 * 
 * REAL STRIPE PRICE IDs CONFIGURED:
 * - monthly_basic: price_1SW3RiGZrRdZy3W9IuHbiwyB ($9.99/month)
 * - monthly_starter: price_1SW3RxGZrRdZy3W9tGHTuxrH ($29/month)
 * - monthly_creator: price_1SW3SBGZrRdZy3W9HOVsW7wQ ($69/month)
 * - monthly_pro: price_1SW3SQGZrRdZy3W9i7agMkRb ($99/month)
 * - lifetime_founder: price_1SW3SeGZrRdZy3W9qLVKoXWS ($699 one-time)
 * - lifetime_pioneer: price_1SW3SpGZrRdZy3W9CkEEO7Oz ($800 one-time)
 * - lifetime_future: price_1SW3T2GZrRdZy3W9wKv6h59Y ($999 one-time)
 * 
 * TODO: Create Stripe payment links for each price ID and replace placeholder URLs
 */

const RINA_STRIPE_LINKS = {
  // Terminal Pro Plans
  monthly_basic:  "https://buy.stripe.com/test_6oU5kDeCG9ESd3w2bp04800",  // price_1SW3RiGZrRdZy3W9IuHbiwyB
  monthly_starter:"https://buy.stripe.com/test_dRmcN5526bN07JcdU704801",  // price_1SW3RxGZrRdZy3W9tGHTuxrH
  monthly_creator:"https://buy.stripe.com/test_9B600jdyC4ky0gK2bp04802",  // price_1SW3SBGZrRdZy3W9HOVsW7wQ
  monthly_pro:    "https://buy.stripe.com/test_cNi6oH8ei6sG6F89DR04803",  // price_1SW3SQGZrRdZy3W9i7agMkRb
  lifetime_founder:"https://buy.stripe.com/test_aFa6oH3Y22cq1kOdU704804", // price_1SW3SeGZrRdZy3W9qLVKoXWS
  lifetime_pioneer:"https://buy.stripe.com/test_9B64gzcuy2cq5B42bp04805", // price_1SW3SpGZrRdZy3W9CkEEO7Oz
  lifetime_future: "https://buy.stripe.com/test_eVq5kD0LQ5oC7Jc17l04806", // price_1SW3T2GZrRdZy3W9wKv6h59Y
  
  // Music Video Creator Plans (MVC) - LIVE PAYMENT LINKS
  mvc_creator_monthly:  "https://buy.stripe.com/test_4gMeVdgKO18me7A03h04807",
  mvc_studio_monthly:   "https://buy.stripe.com/test_5kQ4gz0LQ04i6F8aHV04808", 
  mvc_label_monthly:    "https://buy.stripe.com/test_9B600j8ei6sGbZs9DR04809",
  mvc_founder_lifetime: "https://buy.stripe.com/test_9B68wPgKO4kyaVobLZ0480a",
  mvc_pioneer_lifetime: "https://buy.stripe.com/test_3cIaEXgKO2cqaVodU70480b",
  mvc_future_lifetime:  "https://buy.stripe.com/test_8x2eVd8eicR44x0cQ30480c"
};

/**
 * Navigate to Stripe checkout for specified plan
 * @param {string} planKey - Key matching RINA_STRIPE_LINKS object
 */
function goToStripe(planKey) {
  const url = RINA_STRIPE_LINKS[planKey];
  if (!url || url.includes("your-")) {
    console.error(`Stripe link not configured for: ${planKey}`);
    alert("Stripe link not configured yet for: " + planKey + ". Please contact support.");
    return;
  }
  
  // Track the checkout attempt
  if (typeof gtag !== 'undefined') {
    gtag('event', 'begin_checkout', {
      plan_key: planKey,
      value: getPlanPrice(planKey),
      currency: 'USD'
    });
  }
  
  // Navigate to Stripe
  window.location.href = url;
}

/**
 * Get plan price for tracking purposes
 * @param {string} planKey 
 * @returns {number} Price in USD
 */
function getPlanPrice(planKey) {
  const prices = {
    // Terminal Pro Plans
    monthly_basic: 9.99,
    monthly_starter: 29,
    monthly_creator: 69,
    monthly_pro: 99,
    lifetime_founder: 699,
    lifetime_pioneer: 800,
    lifetime_future: 999,
    
    // Music Video Creator Plans
    mvc_creator_monthly: 39,
    mvc_studio_monthly: 89,
    mvc_label_monthly: 179,
    mvc_founder_lifetime: 999,
    mvc_pioneer_lifetime: 1299,
    mvc_future_lifetime: 1499
  };
  return prices[planKey] || 0;
}

// Auto-attach to buttons with data-stripe-plan attribute
document.addEventListener("DOMContentLoaded", function() {
  // Event delegation for dynamic content
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-stripe-plan]");
    if (!btn) return;
    
    e.preventDefault();
    const plan = btn.getAttribute("data-stripe-plan");
    goToStripe(plan);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RINA_STRIPE_LINKS, goToStripe };
}