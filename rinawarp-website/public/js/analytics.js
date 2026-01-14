// Analytics Tracking
// Plausible, GA4, and Cloudflare Analytics

// Plausible Analytics (lightweight, privacy-friendly)
if (typeof window.plausible !== 'undefined') {
  window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }
  window.plausible('pageview', { 
    props: { 
      path: window.location.pathname, 
      title: document.title, 
      url: window.location.href 
    } 
  })
}

// GA4 Analytics
document.addEventListener('DOMContentLoaded', function() {
  // Check if GA4 is loaded
  if (typeof gtag !== 'undefined') {
    gtag('config', 'G-XXXXXXXXXX', {
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title
    });
  }
  
  // Track checkout button clicks
  const checkoutButtons = document.querySelectorAll('a[href*="stripe.com"], a[href*="/pricing"], a[href*="/download"]');
  checkoutButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const buttonText = this.textContent.trim();
      const buttonHref = this.getAttribute('href');
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
          'event_category': 'checkout',
          'event_label': buttonText,
          'value': buttonHref
        });
      }
      
      if (typeof window.plausible !== 'undefined') {
        window.plausible('Checkout Click', {
          props: {
            button_text: buttonText,
            button_href: buttonHref
          }
        });
      }
    });
  });
  
  // Track download link clicks
  const downloadLinks = document.querySelectorAll('a[download], a[href$=".vsix"], a[href$=".exe"], a[href$=".dmg"]');
  downloadLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const linkHref = this.getAttribute('href');
      const linkText = this.textContent.trim();
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'download', {
          'event_category': 'download',
          'event_label': linkText,
          'value': linkHref
        });
      }
      
      if (typeof window.plausible !== 'undefined') {
        window.plausible('Download Click', {
          props: {
            download_url: linkHref,
            download_text: linkText
          }
        });
      }
    });
  });
  
  // Track error handling
  window.addEventListener('error', function(event) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'error', {
        'event_category': 'error',
        'event_label': event.message,
        'value': event.filename + ':' + event.lineno
      });
    }
    
    if (typeof window.plausible !== 'undefined') {
      window.plausible('Error', {
        props: {
          message: event.message,
          filename: event.filename,
          line: event.lineno
        }
      });
    }
  });
  
  window.addEventListener('unhandledrejection', function(event) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'error', {
        'event_category': 'unhandled_rejection',
        'event_label': event.reason.message,
        'value': event.reason.stack
      });
    }
    
    if (typeof window.plausible !== 'undefined') {
      window.plausible('Unhandled Rejection', {
        props: {
          reason: event.reason.message,
          stack: event.reason.stack
        }
      });
    }
  });
});