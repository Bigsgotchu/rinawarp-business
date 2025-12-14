// Simple privacy-friendly analytics for RinaWarp
// No personal data collection, only anonymous usage stats

(function() {
  'use strict';
  
  // Simple pageview tracking
  function trackPageview() {
    // Only send basic page info, no personal data
    if (typeof window !== 'undefined' && window.location) {
      const pageData = {
        page: window.location.pathname,
        title: document.title,
        timestamp: new Date().toISOString(),
        referrer: document.referrer || 'direct'
      };
      
      // In production, this would send to your analytics endpoint
      // For now, we'll just log to console in development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Analytics:', pageData);
      }
    }
  }
  
  // Track button clicks (anonymized)
  function trackClick(element) {
    const clickData = {
      action: 'click',
      element: element.tagName,
      text: element.textContent ? element.textContent.substring(0, 50) : '',
      timestamp: new Date().toISOString()
    };
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Click Analytics:', clickData);
    }
  }
  
  // Initialize analytics
  function init() {
    trackPageview();
    
    // Track CTA button clicks
    document.addEventListener('click', function(e) {
      if (e.target.matches('.rw-button, .rw-button-outline') || 
          e.target.closest('.rw-button, .rw-button-outline')) {
        trackClick(e.target);
      }
    });
  }
  
  // Start analytics when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
