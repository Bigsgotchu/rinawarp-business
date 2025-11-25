/*!
 * RinaWarp UI Kit v3.0
 * Modern, feature-rich JavaScript system
 * Built for Mermaid & Unicorn themes with GA4 integration
 */

(function (window, document) {
  'use strict';

  // ================================
  // CONFIGURATION
  // ================================
  var CONFIG = {
    API_BASE: 'https://api.rinawarptech.com',
    GA4_ID: 'G-SZK23HMCVP',
    THEME_STORAGE_KEY: 'rinawarp-theme',
    VERSION: '3.0.0',
    
    // Animation settings
    ANIMATION_DURATION: 300,
    ANIMATION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Seat refresh settings
    SEAT_REFRESH_INTERVAL: 60000, // 1 minute
    SEAT_ENDPOINT: '/api/license-count'
  };

  // ================================
  // UTILITY FUNCTIONS
  // ================================
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function throttle(fn, delay) {
    var last = 0;
    var timeout = null;
    return function () {
      var now = Date.now();
      var args = arguments;
      var remaining = delay - (now - last);
      
      if (remaining <= 0) {
        last = now;
        fn.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(function () {
          last = Date.now();
          timeout = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  }

  function debounce(fn, delay) {
    var timeout = null;
    return function () {
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn.apply(this, args);
      }, delay);
    };
  }

  function safeFetch(url, options) {
    options = options || {};
    options.headers = Object.assign({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }, options.headers || {});

    return fetch(url, options).then(function (response) {
      if (!response.ok) {
        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
      }
      return response;
    });
  }

  function safeFetchJSON(url, options) {
    return safeFetch(url, options).then(function (response) {
      return response.json();
    });
  }

  function serializeForm(form) {
    var data = {};
    var inputs = $all('input, select, textarea', form);
    
    inputs.forEach(function (input) {
      if (input.name && !input.disabled) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          if (input.checked) {
            data[input.name] = input.value;
          }
        } else {
          data[input.name] = input.value;
        }
      }
    });
    
    return data;
  }

  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    
    var toast = document.createElement('div');
    toast.className = 'rw-toast rw-toast-' + type;
    toast.textContent = message;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(function () {
      toast.classList.add('show');
    }, 100);
    
    // Remove after duration
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  // ================================
  // GA4 TRACKING SYSTEM
  // ================================
  var GA4 = {
    initialized: false,
    
    init: function () {
      if (this.initialized || !CONFIG.GA4_ID) return;
      
      // Initialize GA4
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      
      gtag('js', new Date());
      gtag('config', CONFIG.GA4_ID);
      
      this.initialized = true;
      this.trackPageView();
    },
    
    trackPageView: function (customPage) {
      if (!this.initialized) return;
      
      var page = customPage || window.location.pathname;
      gtag('config', CONFIG.GA4_ID, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: page
      });
    },
    
    trackEvent: function (action, category, label, value) {
      if (!this.initialized) return;
      
      gtag('event', action, {
        event_category: category || 'general',
        event_label: label || '',
        value: value
      });
    },
    
    trackPurchase: function (data) {
      this.trackEvent('purchase', 'ecommerce', 'product_purchase', data.value);
    },
    
    trackLead: function (data) {
      this.trackEvent('generate_lead', 'engagement', 'lead_generation', 1);
    },
    
    trackSignup: function (data) {
      this.trackEvent('sign_up', 'engagement', 'user_signup', 1);
    },
    
    trackProductClick: function (product) {
      this.trackEvent('select_item', 'product', product.name, 1);
    },
    
    trackSeatView: function (seatCount) {
      this.trackEvent('view_seat_count', 'engagement', 'seat_display', seatCount);
    },
    
    trackDownload: function (fileName) {
      this.trackEvent('file_download', 'download', fileName, 1);
    },
    
    trackScroll: function (percentage) {
      this.trackEvent('scroll', 'engagement', 'page_scroll', percentage);
    },
    
    trackTimeOnPage: function (seconds) {
      this.trackEvent('timing_complete', 'engagement', 'time_on_page', seconds);
    }
  };

  // ================================
  // THEME SYSTEM
  // ================================
  var Theme = {
    current: 'mermaid',
    init: function () {
      this.load();
      this.setupControls();
    },
    
    load: function () {
      var saved = localStorage.getItem(CONFIG.THEME_STORAGE_KEY);
      if (saved && (saved === 'mermaid' || saved === 'unicorn')) {
        this.current = saved;
      } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.current = 'mermaid';
        } else {
          this.current = 'unicorn';
        }
      }
      
      this.apply();
    },
    
    apply: function () {
      document.body.classList.remove('rw-theme-mermaid', 'rw-theme-unicorn');
      document.body.classList.add('rw-theme-' + this.current);
    },
    
    toggle: function () {
      this.current = this.current === 'mermaid' ? 'unicorn' : 'mermaid';
      this.apply();
      this.save();
      GA4.trackEvent('theme_toggle', 'engagement', 'theme_change', this.current);
    },
    
    set: function (theme) {
      if (theme === 'mermaid' || theme === 'unicorn') {
        this.current = theme;
        this.apply();
        this.save();
      }
    },
    
    save: function () {
      localStorage.setItem(CONFIG.THEME_STORAGE_KEY, this.current);
    },
    
    setupControls: function () {
      var toggle = $('.rw-theme-toggle');
      if (toggle) {
        toggle.addEventListener('click', this.toggle.bind(this));
      }
    }
  };

  // ================================
  // NAVIGATION SYSTEM
  // ================================
  var Navigation = {
    init: function () {
      this.setupMobileMenu();
      this.setupSmoothScroll();
      this.highlightActiveSection();
      this.setupHeaderScroll();
    },
    
    setupMobileMenu: function () {
      var toggle = $('.rw-mobile-menu-toggle');
      var nav = $('.rw-nav');
      
      if (toggle && nav) {
        toggle.addEventListener('click', function () {
          nav.classList.toggle('active');
          toggle.classList.toggle('active');
          
          // Track mobile menu interaction
          GA4.trackEvent('mobile_menu_toggle', 'navigation', 'mobile_menu', nav.classList.contains('active') ? 1 : 0);
        });
      }
    },
    
    setupSmoothScroll: function () {
      var links = $all('a[href^="#"]');
      
      links.forEach(function (link) {
        link.addEventListener('click', function (e) {
          var target = $(this.getAttribute('href'));
          if (target) {
            e.preventDefault();
            
            var headerHeight = $('.rw-header') ? $('.rw-header').offsetHeight : 0;
            var targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
            
            GA4.trackEvent('smooth_scroll', 'navigation', 'internal_link', this.textContent.trim());
          }
        });
      });
    },
    
    highlightActiveSection: function () {
      var sections = $all('section[id]');
      var navLinks = $all('.rw-nav-link');
      
      function highlightCurrent() {
        var scrollPosition = window.scrollY + 100;
        
        sections.forEach(function (section) {
          var sectionTop = section.offsetTop;
          var sectionHeight = section.offsetHeight;
          var sectionId = section.getAttribute('id');
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(function (link) {
              link.classList.remove('active');
              if (link.getAttribute('href') === '#' + sectionId) {
                link.classList.add('active');
              }
            });
          }
        });
      }
      
      window.addEventListener('scroll', throttle(highlightCurrent, 100));
      highlightCurrent();
    },
    
    setupHeaderScroll: function () {
      var header = $('.rw-header');
      if (!header) return;
      
      function handleScroll() {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
      
      window.addEventListener('scroll', throttle(handleScroll, 10));
      handleScroll();
    }
  };

  // ================================
  // MODAL SYSTEM
  // ================================
  var Modal = {
    active: null,
    
    show: function (content, options) {
      options = options || {};
      
      // Close existing modal
      this.hide();
      
      var modal = document.createElement('div');
      modal.className = 'rw-modal';
      modal.innerHTML = `
        <div class="rw-modal-overlay">
          <div class="rw-modal-content" style="${options.style || ''}">
            <button class="rw-modal-close" type="button">&times;</button>
            ${content}
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      document.body.classList.add('modal-open');
      
      // Setup close handlers
      var closeBtn = $('.rw-modal-close', modal);
      var overlay = $('.rw-modal-overlay', modal);
      
      var closeHandler = this.hide.bind(this);
      if (closeBtn) closeBtn.addEventListener('click', closeHandler);
      if (overlay) overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeHandler();
      });
      
      // ESC key handler
      var escHandler = function (e) {
        if (e.key === 'Escape') {
          closeHandler();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
      
      this.active = modal;
      
      // Trigger animation
      setTimeout(function () {
        modal.classList.add('show');
      }, 100);
      
      // Track modal view
      GA4.trackEvent('modal_view', 'engagement', 'modal_opened', options.category || 'general');
      
      return modal;
    },
    
    hide: function () {
      if (!this.active) return;
      
      var modal = this.active;
      modal.classList.remove('show');
      
      setTimeout(function () {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
        document.body.classList.remove('modal-open');
      }, 300);
      
      this.active = null;
    },
    
    confirm: function (message, options) {
      options = options || {};
      var confirmText = options.confirmText || 'Confirm';
      var cancelText = options.cancelText || 'Cancel';
      
      var content = `
        <div class="rw-modal-body">
          <h3>${options.title || 'Confirm Action'}</h3>
          <p>${message}</p>
          <div class="rw-modal-actions">
            <button class="rw-btn rw-btn-secondary rw-modal-cancel" type="button">${cancelText}</button>
            <button class="rw-btn rw-btn-primary rw-modal-confirm" type="button">${confirmText}</button>
          </div>
        </div>
      `;
      
      return new Promise(function (resolve) {
        var modal = Modal.show(content);
        
        $('.rw-modal-confirm', modal).addEventListener('click', function () {
          Modal.hide();
          resolve(true);
        });
        
        $('.rw-modal-cancel', modal).addEventListener('click', function () {
          Modal.hide();
          resolve(false);
        });
      });
    }
  };

  // ================================
  // FORM HANDLING SYSTEM
  // ================================
  var Forms = {
    init: function () {
      this.setupValidation();
      this.setupAsyncSubmission();
      this.setupStripeForms();
    },
    
    setupValidation: function () {
      var forms = $all('form[data-validate]');
      
      forms.forEach(function (form) {
        var inputs = $all('input[required], textarea[required], select[required]', form);
        
        inputs.forEach(function (input) {
          input.addEventListener('blur', Forms.validateField.bind(null, input));
          input.addEventListener('input', Forms.clearFieldError.bind(null, input));
        });
      });
    },
    
    validateField: function (input) {
      var value = input.value.trim();
      var type = input.type;
      var required = input.hasAttribute('required');
      var valid = true;
      var message = '';
      
      // Required validation
      if (required && !value) {
        valid = false;
        message = 'This field is required';
      }
      
      // Email validation
      else if (type === 'email' && value) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          valid = false;
          message = 'Please enter a valid email address';
        }
      }
      
      // Phone validation
      else if (type === 'tel' && value) {
        var phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          valid = false;
          message = 'Please enter a valid phone number';
        }
      }
      
      // Apply validation result
      this.applyFieldValidation(input, valid, message);
      
      return valid;
    },
    
    applyFieldValidation: function (input, isValid, message) {
      input.classList.remove('invalid', 'valid');
      input.classList.add(isValid ? 'valid' : 'invalid');
      
      var errorElement = input.parentNode.querySelector('.field-error');
      if (errorElement) {
        errorElement.remove();
      }
      
      if (!isValid && message) {
        var error = document.createElement('div');
        error.className = 'field-error';
        error.textContent = message;
        input.parentNode.appendChild(error);
      }
    },
    
    clearFieldError: function (input) {
      input.classList.remove('invalid');
      var errorElement = input.parentNode.querySelector('.field-error');
      if (errorElement) {
        errorElement.remove();
      }
    },
    
    setupAsyncSubmission: function () {
      var forms = $all('form[data-async]');
      
      forms.forEach(function (form) {
        form.addEventListener('submit', Forms.handleAsyncSubmit.bind(null, form));
      });
    },
    
    handleAsyncSubmit: function (form, e) {
      e.preventDefault();
      
      var submitBtn = $('button[type="submit"]', form);
      var originalText = submitBtn ? submitBtn.textContent : '';
      
      // Validate all fields
      var inputs = $all('input[required], textarea[required], select[required]', form);
      var isValid = true;
      
      inputs.forEach(function (input) {
        if (!Forms.validateField(input)) {
          isValid = false;
        }
      });
      
      if (!isValid) {
        showToast('Please fix the errors in the form', 'error');
        return;
      }
      
      // Disable form during submission
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }
      
      // Serialize form data
      var data = serializeForm(form);
      
      // Determine endpoint
      var action = form.getAttribute('action');
      var method = form.getAttribute('method') || 'POST';
      
      // Submit form
      safeFetch(action, {
        method: method,
        body: JSON.stringify(data)
      })
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        if (result.success) {
          showToast('Form submitted successfully!', 'success');
          form.reset();
          
          // Track form submission
          GA4.trackEvent('form_submit', 'engagement', form.className, 1);
          
          // Trigger custom success callback
          if (typeof form.onsuccess === 'function') {
            form.onsuccess(result);
          }
        } else {
          showToast(result.message || 'Submission failed', 'error');
        }
      })
      .catch(function (error) {
        showToast('Network error: ' + error.message, 'error');
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
    },
    
    setupStripeForms: function () {
      var forms = $all('form[data-stripe]');
      
      forms.forEach(function (form) {
        form.addEventListener('submit', Forms.handleStripeSubmit.bind(null, form));
      });
    },
    
    handleStripeSubmit: function (form, e) {
      e.preventDefault();
      
      var submitBtn = $('button[type="submit"]', form);
      var originalText = submitBtn ? submitBtn.textContent : '';
      
      // Get Stripe public key from data attribute
      var publicKey = form.getAttribute('data-stripe-public');
      if (!publicKey) {
        showToast('Stripe configuration missing', 'error');
        return;
      }
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
      }
      
      // This would integrate with Stripe.js
      // For now, simulate the process
      setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
        
        showToast('Stripe integration would be processed here', 'success');
        GA4.trackPurchase({
          value: form.getAttribute('data-amount') || 0,
          currency: 'USD'
        });
      }, 2000);
    }
  };

  // ================================
  // SEAT COUNT SYSTEM
  // ================================
  var SeatCount = {
    current: 0,
    refreshTimer: null,
    init: function () {
      this.refresh();
      this.startAutoRefresh();
    },
    
    refresh: function () {
      safeFetchJSON(CONFIG.API_BASE + CONFIG.SEAT_ENDPOINT)
      .then(function (data) {
        SeatCount.update(data.count || 0);
      })
      .catch(function (error) {
        console.warn('Seat count refresh failed:', error);
      });
    },
    
    update: function (count) {
      this.current = count;
      
      var displays = $all('[data-seat-count]');
      displays.forEach(function (display) {
        display.textContent = count.toLocaleString();
      });
      
      GA4.trackSeatView(count);
    },
    
    startAutoRefresh: function () {
      this.refreshTimer = setInterval(function () {
        SeatCount.refresh();
      }, CONFIG.SEAT_REFRESH_INTERVAL);
    },
    
    stopAutoRefresh: function () {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    }
  };

  // ================================
  // SCROLL ANIMATIONS
  // ================================
  var ScrollAnimations = {
    init: function () {
      if ('IntersectionObserver' in window) {
        this.setupIntersectionObserver();
      } else {
        // Fallback for older browsers
        this.setupScrollListener();
      }
    },
    
    setupIntersectionObserver: function () {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });
      
      var elements = $all('[data-animate]');
      elements.forEach(function (element) {
        observer.observe(element);
      });
    },
    
    setupScrollListener: function () {
      var elements = $all('[data-animate]');
      
      function checkAnimations() {
        elements.forEach(function (element) {
          if (element.classList.contains('animate-in')) return;
          
          var elementTop = element.getBoundingClientRect().top;
          var windowHeight = window.innerHeight;
          
          if (elementTop < windowHeight * 0.8) {
            element.classList.add('animate-in');
          }
        });
      }
      
      window.addEventListener('scroll', throttle(checkAnimations, 100));
      checkAnimations();
    }
  };

  // ================================
  // IMAGE FALLBACK LOADER
  // ================================
  var ImageLoader = {
    init: function () {
      var images = $all('img[data-fallback]');
      images.forEach(this.setupImage.bind(this));
    },
    
    setupImage: function (img) {
      var fallback = img.getAttribute('data-fallback');
      
      img.addEventListener('error', function () {
        if (fallback && img.src !== fallback) {
          img.src = fallback;
        }
      });
      
      img.addEventListener('load', function () {
        img.classList.add('loaded');
      });
    }
  };

  // ================================
  // ANALYTICS & TIMING
  // ================================
  var Analytics = {
    startTime: Date.now(),
    scrollTracked: new Set(),
    
    init: function () {
      this.trackScrollPercentages();
      this.trackTimeOnPage();
      this.trackUserEngagement();
    },
    
    trackScrollPercentages: function () {
      var thresholds = [25, 50, 75, 100];
      
      function checkScroll() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var scrollPercent = Math.round((scrollTop / docHeight) * 100);
        
        thresholds.forEach(function (threshold) {
          if (scrollPercent >= threshold && !Analytics.scrollTracked.has(threshold)) {
            Analytics.scrollTracked.add(threshold);
            GA4.trackScroll(threshold);
          }
        });
      }
      
      window.addEventListener('scroll', throttle(checkScroll, 250));
    },
    
    trackTimeOnPage: function () {
      var intervals = [30, 60, 120, 300]; // seconds
      
      intervals.forEach(function (seconds) {
        setTimeout(function () {
          var timeSpent = Math.round((Date.now() - Analytics.startTime) / 1000);
          GA4.trackTimeOnPage(timeSpent);
        }, seconds * 1000);
      });
    },
    
    trackUserEngagement: function () {
      var interactions = ['click', 'scroll', 'keydown'];
      
      interactions.forEach(function (interaction) {
        var handler = throttle(function () {
          GA4.trackEvent('user_engagement', 'engagement', interaction, 1);
        }, 5000); // Track max once per 5 seconds
        
        document.addEventListener(interaction, handler);
      });
    }
  };

  // ================================
  // ERROR BOUNDARY
  // ================================
  var ErrorBoundary = {
    init: function () {
      window.addEventListener('error', this.handleError.bind(this));
      window.addEventListener('unhandledrejection', this.handleRejection.bind(this));
    },
    
    handleError: function (event) {
      console.error('JavaScript Error:', event.error);
      this.reportError(event.error, 'javascript_error');
    },
    
    handleRejection: function (event) {
      console.error('Unhandled Promise Rejection:', event.reason);
      this.reportError(event.reason, 'promise_rejection');
    },
    
    reportError: function (error, type) {
      // Report to analytics
      GA4.trackEvent('javascript_error', 'error', type + ': ' + (error.message || error.toString()), 1);
      
      // Could also send to error reporting service
      console.error('RinaWarp Error:', type, error);
    }
  };

  // ================================
  // INITIALIZATION
  // ================================
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    // Initialize all systems
    GA4.init();
    Theme.init();
    Navigation.init();
    Forms.init();
    SeatCount.init();
    ScrollAnimations.init();
    ImageLoader.init();
    Analytics.init();
    ErrorBoundary.init();
    
    // Add loaded class to body
    document.body.classList.add('rw-loaded');
    
    console.log('RinaWarp UI Kit v' + CONFIG.VERSION + ' loaded successfully');
  }

  // Start initialization
  init();

  // Export to global scope for manual control
  window.RinaWarpUI = {
    GA4: GA4,
    Theme: Theme,
    Navigation: Navigation,
    Modal: Modal,
    Forms: Forms,
    SeatCount: SeatCount,
    showToast: showToast,
    Modal: Modal,
    version: CONFIG.VERSION
  };

})(window, document);