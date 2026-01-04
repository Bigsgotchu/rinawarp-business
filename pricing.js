(() => {
  // Footer year
  const y = document.getElementById("y");
  if (y) y.textContent = String(new Date().getFullYear());

  // Load lifetime status and update UI with dynamic pricing
  async function loadLifetimeStatus() {
    try {
      const API_BASE = "https://api.rinawarptech.com";
      const res = await fetch(`${API_BASE}/api/pricing`, { method: 'GET' });
      if (!res.ok) {
        console.warn('Failed to load pricing data');
        return;
      }

      const data = await res.json();

      // Apply lifetime visibility based on API data
      applyLifetimeVisibility(data);

    } catch (error) {
      console.warn('Error loading pricing data:', error);
    }
  }

  // Apply lifetime visibility based on API response format
  function applyLifetimeVisibility(pricing) {
    const lifetime = Array.isArray(pricing.lifetime) ? pricing.lifetime : [];

    const soldOutEl = document.getElementById("sold-out-message");
    const offersEl = document.getElementById("lifetime-offers-container");

    // "Sold out" should only show if there are lifetime plans AND they are ALL sold out.
    const allSoldOut = lifetime.length > 0 && lifetime.every((p) => p && p.soldOut === true);
    const hasAnyAvailable = lifetime.some((p) => p && p.soldOut === false);

    if (soldOutEl) soldOutEl.hidden = !allSoldOut;
    if (offersEl) offersEl.hidden = !hasAnyAvailable;

    // If you have per-plan cards:
    for (const plan of lifetime) {
      const el = document.getElementById(`${plan.id}-offer`); // example: founder_lifetime-offer
      if (el) el.hidden = plan.soldOut;
    }
  }

  // Handle checkout button clicks
  function setupCheckoutButtons() {
    document.querySelectorAll('.buy-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();

        const plan = btn.getAttribute('data-plan');
        if (!plan) return;

        // Disable button during processing
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Processing...';

        try {
          const API_BASE = "https://rinawarptech.com";
          const response = await fetch(`${API_BASE}/api/checkout-v2`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              plan: plan,
              successUrl: 'https://rinawarptech.com/success.html?session_id={CHECKOUT_SESSION_ID}',
              cancelUrl: 'https://rinawarptech.com/cancel.html'
            })
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Checkout failed');
          }

          if (result.url) {
            // Redirect to Stripe Checkout
            window.location.href = result.url;
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          console.error('Checkout error:', error);
          alert(error.message || 'Checkout failed. Please try again.');

          // Re-enable button
          btn.disabled = false;
          btn.textContent = originalText;
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadLifetimeStatus();
      setupCheckoutButtons();
    });
  } else {
    loadLifetimeStatus();
    setupCheckoutButtons();
  }
})();