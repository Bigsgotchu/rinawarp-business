// Google Analytics 4 Simple & Reliable Tracking
// Measurement ID: G-SZK23HMCVP

// Initialize dataLayer and gtag
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
window.gtag = gtag;
gtag('js', new Date());

// Load GA4 script
const script = document.createElement('script');
script.async = true;
script.src = 'https://www.googletagmanager.com/gtag/js?id=G-SZK23HMCVP';
document.head.appendChild(script);

// Initialize GA4
gtag('config', 'G-SZK23HMCVP', {
  send_page_view: true,
});

// Simple RinaWarp Analytics Object
window.RinaWarpAnalytics = {
  trackPageView: (page_path, page_title) => {
    gtag('config', 'G-SZK23HMCVP', {
      page_path: page_path,
      page_title: page_title,
    });
  },

  trackEvent: (event_name, parameters = {}) => {
    gtag('event', event_name, parameters);
  },

  trackPlanSelection: (plan_type, plan_price = 0) => {
    gtag('event', 'plan_selected', {
      plan_type: plan_type,
      plan_price: plan_price,
    });
  },

  trackCheckoutStart: (plan_name, plan_price) => {
    gtag('event', 'begin_checkout', {
      plan_name: plan_name,
      plan_price: plan_price,
    });
  },

  trackPurchase: (plan_name, plan_price) => {
    gtag('event', 'purchase', {
      plan_name: plan_name,
      plan_price: plan_price,
      value: plan_price,
      currency: 'USD',
    });
  },

  trackDownload: (platform, plan_type) => {
    gtag('event', 'file_download', {
      platform: platform,
      plan_type: plan_type,
    });
  },

  trackEngagement: (action, element) => {
    gtag('event', 'engagement', {
      action: action,
      element: element,
    });
  },

  trackPricingPageView: () => {
    gtag('event', 'pricing_page_view', {
      page_location: window.location.href,
    });
  },

  trackEarlyBirdPurchase: (value = 399) => {
    gtag('event', 'early_bird_purchase', {
      value: value,
      currency: 'USD',
    });
  },

  trackProPlanPurchase: (value = 29) => {
    gtag('event', 'pro_plan_purchase', {
      value: value,
      currency: 'USD',
    });
  },

  trackTeamPlanPurchase: (value = 99) => {
    gtag('event', 'team_plan_purchase', {
      value: value,
      currency: 'USD',
    });
  },

  trackFreeTrialSignup: () => {
    gtag('event', 'free_trial_signup', {
      value: 0,
      currency: 'USD',
    });
  },
};

// Auto-track page view when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  RinaWarpAnalytics.trackPageView(window.location.pathname, document.title);
  console.log('✅ GA4 Simple tracking loaded');
});
