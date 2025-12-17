// Google Analytics 4 tracking functions for RinaWarp Terminal Pro

// Initialize Google Analytics
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual GA4 measurement ID

// Initialize gtag if not already loaded
if (typeof gtag === 'undefined') {
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
}

// Track page views
export const trackPageView = (pagePath, pageTitle) => {
  if (typeof gtag !== 'undefined') {
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
};

// Track plan selection
export const trackPlanSelection = (planName, price) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'plan_selection', {
      event_category: 'pricing',
      event_label: planName,
      value: parseFloat(price.replace('$', '')),
    });
  }
};

// Track checkout start
export const trackCheckoutStart = (planName, price) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'begin_checkout', {
      event_category: 'ecommerce',
      event_label: planName,
      value: price,
      currency: 'USD',
      items: [
        {
          item_id: planName.toLowerCase().replace(' ', '_'),
          item_name: `RinaWarp ${planName}`,
          category: 'Software',
          quantity: 1,
          price: price,
        },
      ],
    });
  }
};

// Track purchase completion
export const trackPurchase = (transactionId, planName, price) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: price,
      currency: 'USD',
      items: [
        {
          item_id: planName.toLowerCase().replace(' ', '_'),
          item_name: `RinaWarp ${planName}`,
          category: 'Software',
          quantity: 1,
          price: price,
        },
      ],
    });
  }
};

// Track download events
export const trackDownload = (platform, planType) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'file_download', {
      event_category: 'engagement',
      event_label: `${platform}_${planType}`,
      file_name: `rinawarp-terminal-${platform}`,
      file_extension:
        platform === 'macos'
          ? 'dmg'
          : platform === 'windows'
            ? 'exe'
            : 'appimage',
    });
  }
};

// Track general engagement
export const trackEngagement = (action, label) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'engagement', {
      event_category: 'user_interaction',
      event_label: label,
      action: action,
    });
  }
};

// Track pricing page view
export const trackPricingPageView = () => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      event_category: 'navigation',
      event_label: 'pricing_page',
    });
  }
};

// Track Early Bird purchase
export const trackEarlyBirdPurchase = (transactionId) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: 399,
      currency: 'USD',
      items: [
        {
          item_id: 'early_bird',
          item_name: 'RinaWarp Early Bird',
          category: 'Software',
          quantity: 1,
          price: 399,
        },
      ],
    });
  }
};

// Track Pro plan purchase
export const trackProPlanPurchase = (transactionId) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: 29,
      currency: 'USD',
      items: [
        {
          item_id: 'pro_plan',
          item_name: 'RinaWarp Pro Plan',
          category: 'Software',
          quantity: 1,
          price: 29,
        },
      ],
    });
  }
};

// Track Team plan purchase
export const trackTeamPlanPurchase = (transactionId) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: 99,
      currency: 'USD',
      items: [
        {
          item_id: 'team_plan',
          item_name: 'RinaWarp Team Plan',
          category: 'Software',
          quantity: 1,
          price: 99,
        },
      ],
    });
  }
};

// Track free trial signup
export const trackFreeTrialSignup = (email) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'sign_up', {
      event_category: 'engagement',
      event_label: 'free_trial',
      method: 'email',
    });
  }
};

// Track demo start
export const trackDemoStart = () => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'demo_started', {
      event_category: 'engagement',
      event_label: 'interactive_demo',
    });
  }
};

// Track feature usage
export const trackFeatureUsage = (featureName) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'feature_used', {
      event_category: 'product',
      event_label: featureName,
    });
  }
};

// Track error events
export const trackError = (errorMessage, errorLocation) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'exception', {
      description: errorMessage,
      fatal: false,
      event_category: 'error',
      event_label: errorLocation,
    });
  }
};

// Track search events
export const trackSearch = (searchTerm) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'search', {
      search_term: searchTerm,
      event_category: 'engagement',
    });
  }
};

// Track scroll depth
export const trackScrollDepth = (depth) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'scroll', {
      event_category: 'engagement',
      event_label: `${depth}%`,
      value: depth,
    });
  }
};

// Track time on page
export const trackTimeOnPage = (timeInSeconds) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'timing_complete', {
      name: 'time_on_page',
      value: timeInSeconds,
      event_category: 'engagement',
    });
  }
};

// Track video interactions
export const trackVideoInteraction = (action, videoTitle) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'video_interaction', {
      event_category: 'engagement',
      event_label: videoTitle,
      action: action,
    });
  }
};

// Track form submissions
export const trackFormSubmission = (formName, success) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'form_submit', {
      event_category: 'engagement',
      event_label: formName,
      success: success,
    });
  }
};

// Track social media clicks
export const trackSocialClick = (platform) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'social_click', {
      event_category: 'social',
      event_label: platform,
    });
  }
};

// Track newsletter signup
export const trackNewsletterSignup = (email) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'newsletter_signup', {
      event_category: 'engagement',
      event_label: 'email_signup',
    });
  }
};

// Track help/support interactions
export const trackSupportInteraction = (interactionType) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'support_interaction', {
      event_category: 'support',
      event_label: interactionType,
    });
  }
};

// Track custom events
export const trackCustomEvent = (eventName, parameters = {}) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, parameters);
  }
};

export default {
  trackPageView,
  trackPlanSelection,
  trackCheckoutStart,
  trackPurchase,
  trackDownload,
  trackEngagement,
  trackPricingPageView,
  trackEarlyBirdPurchase,
  trackProPlanPurchase,
  trackTeamPlanPurchase,
  trackFreeTrialSignup,
  trackDemoStart,
  trackFeatureUsage,
  trackError,
  trackSearch,
  trackScrollDepth,
  trackTimeOnPage,
  trackVideoInteraction,
  trackFormSubmission,
  trackSocialClick,
  trackNewsletterSignup,
  trackSupportInteraction,
  trackCustomEvent,
};
