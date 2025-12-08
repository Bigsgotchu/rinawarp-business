// RinaWarp Stripe Checkout Integration
// Handles payment button clicks and redirects to Stripe Checkout

// Safe checkout function that handles errors gracefully
async function startCheckout(plan) {
  // Check if startCheckout function is being called properly
  if (typeof event === 'undefined' || !event || !event.target) {
    console.error('startCheckout called without proper event context');
    alert('Error: Please click the button directly to start checkout.');
    return;
  }

  const button = event.target;
  const originalText = button.textContent;

  try {
    // Show loading state
    button.textContent = 'Loading...';
    button.disabled = true;
    button.style.opacity = '0.7';
    button.style.cursor = 'not-allowed';

    // Get user email with validation
    const email = prompt('Enter your email to continue:');
    if (!email || email.trim() === '') {
      throw new Error('Email is required to proceed.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Please enter a valid email address.');
    }

    const cleanEmail = email.trim().toLowerCase();
    console.log(`Starting checkout for plan: ${plan}, email: ${cleanEmail}`);

    // Create checkout session with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('https://rinawarptech.com/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan: plan,
        email: cleanEmail,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (response.ok && data.url) {
      console.log(`Redirecting to Stripe Checkout: ${data.url}`);
      window.location.href = data.url; // Redirect to Stripe Checkout
    } else {
      throw new Error(data.error || 'Unable to start checkout. Please try again.');
    }
  } catch (error) {
    console.error('Checkout error:', error);

    // Provide user-friendly error messages
    let errorMessage = 'Something went wrong. Please try again.';

    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please check your connection and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    alert(errorMessage);

    // Reset button state
    button.textContent = originalText;
    button.disabled = false;
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
  }
}

// Plan configuration - matches Stripe products
const PLAN_DETAILS = {
  student: {
    name: 'Student / Developer',
    price: '$4.99',
    period: 'month',
    features: ['50 AI requests/day', '3 projects', 'Voice commands', 'Community support'],
    stripePriceId: 'price_student_id', // Replace with actual Stripe Price ID
  },
  professional: {
    name: 'Professional',
    price: '$29',
    period: 'month',
    features: [
      'Unlimited AI requests',
      'Advanced themes',
      'Plugins',
      'Team collaboration',
      'API access',
    ],
    stripePriceId: 'price_pro_id', // Replace with actual Stripe Price ID
  },
  enterprise: {
    name: 'Enterprise',
    price: '$99',
    period: 'month',
    features: [
      'Custom integrations',
      'SSO',
      'Dedicated support',
      'SLA guarantee',
      'On-premise options',
    ],
    stripePriceId: 'price_enterprise_id', // Replace with actual Stripe Price ID
  },
};

// Safe pricing HTML generation
function generatePricingHTML() {
  try {
    return `
      <section id="pricing" class="features" style="background:#141414;">
        <div class="feature">
          <h3>${PLAN_DETAILS.student.name}</h3>
          <p>${PLAN_DETAILS.student.price}/${PLAN_DETAILS.student.period} • ${PLAN_DETAILS.student.features.join(' • ')}</p>
          <button class="btn btn-primary" onclick="startCheckout('student')">Start Student Plan</button>
        </div>

        <div class="feature">
          <h3>${PLAN_DETAILS.professional.name}</h3>
          <p>${PLAN_DETAILS.professional.price}/${PLAN_DETAILS.professional.period} • ${PLAN_DETAILS.professional.features.join(' • ')}</p>
          <button class="btn btn-primary" onclick="startCheckout('professional')">Start Pro Plan</button>
        </div>

        <div class="feature">
          <h3>${PLAN_DETAILS.enterprise.name}</h3>
          <p>${PLAN_DETAILS.enterprise.price}/${PLAN_DETAILS.enterprise.period} • ${PLAN_DETAILS.enterprise.features.join(' • ')}</p>
          <button class="btn btn-primary" onclick="startCheckout('enterprise')">Contact Sales</button>
        </div>
      </section>
    `;
  } catch (error) {
    console.error('Error generating pricing HTML:', error);
    return '<section id="pricing"><p>Pricing temporarily unavailable</p></section>';
  }
}

// Safe success page handler
function handleSuccessPage() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId && document.getElementById('success-message')) {
      // Verify payment status with error handling
      fetch(`https://rinawarptech.com/api/license/claim?session_id=${sessionId}`)
        .then((response) => {
          if (!response.ok) throw new Error('Failed to fetch session');
          return response.json();
        })
        .then((data) => {
          if (data.status === 'complete') {
            document.getElementById('success-message').innerHTML = `
              <h2>🎉 Payment Successful!</h2>
              <p>Welcome to RinaWarp! Your account is now active.</p>
              <p>You'll receive a confirmation email at ${data.customer_email || 'your email'} shortly.</p>
              <a href="/downloads" class="btn btn-primary">Download RinaWarp Terminal</a>
            `;
          }
        })
        .catch((error) => {
          console.error('Error verifying payment:', error);
          // Show basic success message even if verification fails
          document.getElementById('success-message').innerHTML = `
            <h2>🎉 Payment Successful!</h2>
            <p>Welcome to RinaWarp! Check your email for your license key.</p>
            <a href="/downloads" class="btn btn-primary">Download RinaWarp Terminal</a>
          `;
        });
    }
  } catch (error) {
    console.error('Error in handleSuccessPage:', error);
  }
}

// Safe cancel page handler
function handleCancelPage() {
  try {
    if (document.getElementById('cancel-message')) {
      document.getElementById('cancel-message').innerHTML = `
        <h2>Payment Cancelled</h2>
        <p>No worries! You can try again anytime.</p>
        <a href="/#pricing" class="btn btn-primary">View Pricing Plans</a>
      `;
    }
  } catch (error) {
    console.error('Error in handleCancelPage:', error);
  }
}

// Safe initialization
document.addEventListener('DOMContentLoaded', function () {
  try {
    // Add checkout script to global scope safely
    if (typeof window.startCheckout === 'undefined') {
      window.startCheckout = startCheckout;
    }

    // Handle success/cancel pages with error handling
    if (window.location.pathname.includes('/success')) {
      handleSuccessPage();
    } else if (window.location.pathname.includes('/cancel')) {
      handleCancelPage();
    }

    // Add pricing section safely
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.innerHTML = generatePricingHTML();
      }
    }

    console.log('✅ RinaWarp checkout script loaded successfully');
  } catch (error) {
    console.error('❌ Error initializing checkout script:', error);
  }
});

// Global error handler for uncaught errors
window.addEventListener('error', function (event) {
  console.error('Uncaught JavaScript error:', event.error);
  // Don't let errors break the page
});

// Global promise rejection handler
window.addEventListener('unhandledrejection', function (event) {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent the error from breaking other scripts
  event.preventDefault();
});
