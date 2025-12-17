// Google Analytics 4 Ultimate Tracking Configuration - FIXED VERSION
// Measurement ID: G-SZK23HMCVP
// Complete setup with all advanced features

// Ensure gtag is available before using it
(function () {
  'use strict';

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());

  // Load GA4 script safely
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-SZK23HMCVP';
  script.onload = function () {
    // Initialize GA4 with complete configuration
    gtag('config', 'G-SZK23HMCVP', {
      send_page_view: true,
      custom_map: {
        custom_parameter_1: 'plan_type',
        custom_parameter_2: 'user_type',
        custom_parameter_3: 'traffic_source',
        custom_parameter_4: 'campaign_type',
        custom_parameter_5: 'device_type',
      },
      enhanced_measurement: {
        scrolls: true,
        outbound_clicks: true,
        site_search: true,
        video_engagement: true,
        file_downloads: true,
      },
    });

    console.log('✅ GA4 script loaded and configured');
  };

  script.onerror = function () {
    console.error('❌ Failed to load GA4 script');
  };

  document.head.appendChild(script);

  // Safe tracking function wrapper
  function safeGtag() {
    if (typeof window.gtag === 'function') {
      try {
        window.gtag.apply(window, arguments);
      } catch (error) {
        console.error('GA4 tracking error:', error);
      }
    } else {
      console.warn('GA4 not ready, queuing event:', arguments);
      // Queue events until gtag is ready
      if (!window.ga4Queue) window.ga4Queue = [];
      window.ga4Queue.push(arguments);
    }
  }

  // Process queued events when gtag becomes available
  function processQueue() {
    if (window.ga4Queue && window.ga4Queue.length > 0) {
      console.log('Processing', window.ga4Queue.length, 'queued GA4 events');
      window.ga4Queue.forEach((args) => {
        try {
          window.gtag.apply(window, args);
        } catch (error) {
          console.error('Error processing queued event:', error);
        }
      });
      window.ga4Queue = [];
    }
  }

  // Check for gtag availability periodically
  const checkGtag = setInterval(() => {
    if (typeof window.gtag === 'function') {
      clearInterval(checkGtag);
      processQueue();
    }
  }, 100);

  // Ultimate RinaWarp Analytics Object
  window.RinaWarpAnalytics = {
    // Core tracking functions
    trackPageView: (page_path, page_title, custom_params = {}) => {
      safeGtag('config', 'G-SZK23HMCVP', {
        page_path: page_path,
        page_title: page_title,
        ...custom_params,
      });
    },

    trackEvent: (event_name, parameters = {}) => {
      safeGtag('event', event_name, {
        ...parameters,
        timestamp: Date.now(),
        session_id: Date.now().toString(),
      });
    },

    // E-commerce tracking
    trackPurchase: (transactionId, value, items, currency = 'USD') => {
      safeGtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: currency,
        items: items,
      });
    },

    trackBeginCheckout: (value, items, currency = 'USD') => {
      safeGtag('event', 'begin_checkout', {
        currency: currency,
        value: value,
        items: items,
      });
    },

    // Plan-specific tracking
    trackEarlyBirdPurchase: (value = 399) => {
      safeGtag('event', 'early_bird_purchase', {
        value: value,
        currency: 'USD',
        transaction_id: Date.now().toString(),
        items: [
          {
            item_id: 'early_bird_lifetime',
            item_name: 'RinaWarp Terminal Pro - Early Bird Lifetime',
            category: 'Software',
            quantity: 1,
            price: value,
          },
        ],
        plan_type: 'early_bird',
        user_type: 'purchaser',
        custom_parameter_1: 'early_bird',
      });
    },

    trackProPlanPurchase: (value = 49) => {
      safeGtag('event', 'pro_plan_purchase', {
        value: value,
        currency: 'USD',
        transaction_id: Date.now().toString(),
        items: [
          {
            item_id: 'pro_monthly',
            item_name: 'RinaWarp Terminal Pro - Pro Monthly',
            category: 'Software',
            quantity: 1,
            price: value,
          },
        ],
        plan_type: 'pro',
        user_type: 'purchaser',
        custom_parameter_1: 'pro',
      });
    },

    trackTeamPlanPurchase: (value = 99) => {
      safeGtag('event', 'team_plan_purchase', {
        value: value,
        currency: 'USD',
        transaction_id: Date.now().toString(),
        items: [
          {
            item_id: 'team_monthly',
            item_name: 'RinaWarp Terminal Pro - Team Monthly',
            category: 'Software',
            quantity: 1,
            price: value,
          },
        ],
        plan_type: 'team',
        user_type: 'purchaser',
        custom_parameter_1: 'team',
      });
    },

    trackFreeTrialSignup: () => {
      safeGtag('event', 'free_trial_signup', {
        value: 0,
        currency: 'USD',
        plan_type: 'free_trial',
        user_type: 'trial_user',
        custom_parameter_1: 'free_trial',
      });
    },

    // Engagement tracking
    trackPlanSelection: (plan_type, plan_price = 0) => {
      safeGtag('event', 'plan_selected', {
        plan_type: plan_type,
        plan_price: plan_price,
        user_type: 'prospect',
        custom_parameter_1: plan_type,
        custom_parameter_2: 'prospect',
      });
    },

    trackPricingPageView: () => {
      safeGtag('event', 'pricing_page_view', {
        page_location: window.location.href,
        page_title: 'Pricing - RinaWarp Terminal Pro',
        user_type: 'prospect',
        custom_parameter_2: 'prospect',
      });
    },

    trackEarlyBirdUrgency: (spots_remaining) => {
      safeGtag('event', 'early_bird_urgency', {
        spots_remaining: spots_remaining,
        plan_type: 'early_bird',
        custom_parameter_1: 'early_bird',
      });
    },

    // Social and marketing tracking
    trackSocialEngagement: (platform, action) => {
      safeGtag('event', 'social_engagement', {
        platform: platform,
        action: action,
        custom_parameter_3: platform,
      });
    },

    trackDownload: (file_type, plan_type) => {
      safeGtag('event', 'file_download', {
        file_type: file_type,
        plan_type: plan_type,
        custom_parameter_1: plan_type,
      });
    },

    // Advanced engagement tracking
    trackTimeOnPage: (time_spent) => {
      safeGtag('event', 'time_on_page', {
        time_spent: time_spent,
        user_type: 'engaged_user',
        custom_parameter_2: 'engaged_user',
      });
    },

    trackScrollDepth: (percentage) => {
      safeGtag('event', 'scroll_depth', {
        percentage: percentage,
      });
    },

    trackFormSubmission: (form_type) => {
      safeGtag('event', 'form_submit', {
        form_type: form_type,
      });
    },

    trackButtonClick: (button_name, page_location) => {
      safeGtag('event', 'button_click', {
        button_name: button_name,
        page_location: page_location,
      });
    },

    // Search tracking
    trackSearch: (search_term) => {
      safeGtag('event', 'search', {
        search_term: search_term,
      });
    },

    // Video tracking
    trackVideoPlay: (video_title, video_duration) => {
      safeGtag('event', 'video_play', {
        video_title: video_title,
        video_duration: video_duration,
      });
    },

    // Outbound link tracking
    trackOutboundClick: (link_url, link_text) => {
      safeGtag('event', 'click', {
        event_category: 'outbound',
        event_label: link_text,
        link_url: link_url,
      });
    },

    // User engagement
    trackUserEngagement: (engagement_time) => {
      safeGtag('event', 'user_engagement', {
        engagement_time_msec: engagement_time,
      });
    },

    // Custom conversion tracking
    trackConversion: (conversion_type, value, currency = 'USD') => {
      safeGtag('event', conversion_type, {
        value: value,
        currency: currency,
        conversion_type: conversion_type,
      });
    },
  };

  // Auto-tracking features - only when DOM is ready
  function initializeAutoTracking() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeAutoTracking);
      return;
    }

    // Track initial page view
    window.RinaWarpAnalytics.trackPageView(
      window.location.pathname,
      document.title
    );

    if (window.location.pathname.includes('pricing')) {
      window.RinaWarpAnalytics.trackPricingPageView();
    }

    console.log('🚀 RinaWarp Analytics loaded successfully!');
    console.log('📊 Measurement ID: G-SZK23HMCVP');
    console.log('🔗 GA4 Dashboard: https://analytics.google.com');

    // Auto-track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100
      );
      if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
        maxScroll = scrollPercent;
        window.RinaWarpAnalytics.trackScrollDepth(scrollPercent);
      }
    });

    // Auto-track time on page
    let startTime = Date.now();
    let engagementTime = 0;
    let lastActiveTime = Date.now();

    document.addEventListener('mousemove', () => {
      lastActiveTime = Date.now();
    });

    document.addEventListener('keypress', () => {
      lastActiveTime = Date.now();
    });

    setInterval(() => {
      if (Date.now() - lastActiveTime < 30000) {
        engagementTime += 10000;
        window.RinaWarpAnalytics.trackUserEngagement(engagementTime);
      }
    }, 10000);

    window.addEventListener('beforeunload', () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      window.RinaWarpAnalytics.trackTimeOnPage(timeSpent);
    });

    // Track outbound clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.hostname !== window.location.hostname) {
        window.RinaWarpAnalytics.trackOutboundClick(
          link.href,
          link.textContent
        );
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      const formType = form.id || form.className || 'unknown';
      window.RinaWarpAnalytics.trackFormSubmission(formType);
    });

    // Track search functionality
    const searchInputs = document.querySelectorAll(
      'input[type="search"], input[placeholder*="search" i]'
    );
    searchInputs.forEach((input) => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          window.RinaWarpAnalytics.trackSearch(input.value.trim());
        }
      });
    });

    console.log('🎯 Ultimate GA4 tracking initialized!');
    console.log('📈 All advanced features enabled');
    console.log('🔍 Auto-tracking active');
  }

  // Initialize auto-tracking
  initializeAutoTracking();
})();
