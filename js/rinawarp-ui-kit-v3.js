// CORS FIX: All external API calls disabled to prevent CORS errors
// Mock data provided for development and testing
// function getMockLicenseCount() {
//   return { total: 500, used: 127, remaining: 373, last_updated: '2025-11-29T01:03:29-07:00' };
// }

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
  const CONFIG = {
    API_BASE: '',
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
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(selector)
    );
  }

  function throttle(fn, delay) {
    let last = 0;
    let timeout = null;
    return function () {
      const now = Date.now();
      const args = arguments;
      const remaining = delay - (now - last);

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
    let timeout = null;
    return function () {
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn.apply(this, args);
      }, delay);
    };
  }

  function safeFetch(url, options) {
    options = options || {};
    options.headers = Object.assign(
      {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      options.headers || {}
    );

    return fetch(url, options).then((response) => {
      if (!response.ok) {
        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
      }
      return response;
    });
  }

  function safeFetchJSON(url, options) {
    return safeFetch(url, options).then((response) => {
      return response.json();
    });
  }

  function serializeForm(form) {
    const data = {};
    const inputs = $all('input, select, textarea', form);

    inputs.forEach((input) => {
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

    const toast = document.createElement('div');
    toast.className = 'rw-toast rw-toast-' + type;
    toast.textContent = message;

    // Add to DOM
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    // Remove after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  // ================================
  // GA4 TRACKING SYSTEM
  // ================================
  const GA4 = {
    initialized: false,

    init: function () {
      if (this.initialized || !CONFIG.GA4_ID) return;

      // Initialize GA4
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      window.gtag = gtag;

      gtag('js', new Date());
      gtag('config', CONFIG.GA4_ID);

      this.initialized = true;
      this.trackPageView();
    },

    trackPageView: function (customPage) {
      if (!this.initialized) return;

      const page = customPage || window.location.pathname;
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
      this.trackEvent(
        'view_seat_count',
        'engagement',
        'seat_display',
        seatCount
      );
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
  const Theme = {
    current: 'mermaid',
    init: function () {
      this.load();
      this.setupControls();
    },

    load: function () {
      const saved = localStorage.getItem(CONFIG.THEME_STORAGE_KEY);
      if (saved && (saved === 'mermaid' || saved === 'unicorn')) {
        this.current = saved;
      } else {
        // Check system preference
        if (
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
        ) {
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
      GA4.trackEvent(
        'theme_toggle',
        'engagement',
        'theme_change',
        this.current
      );
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
      const toggle = $('.rw-theme-toggle');
      if (toggle) {
        toggle.addEventListener('click', this.toggle.bind(this));
      }
    }
  };

  // ================================
  // NAVIGATION SYSTEM
  // ================================
  const Navigation = {
    init: function () {
      this.setupMobileMenu();
      this.setupSmoothScroll();
      this.highlightActiveSection();
      this.setupHeaderScroll();
    },

    setupMobileMenu: function () {
      const toggle = $('.rw-mobile-menu-toggle');
      const nav = $('.rw-nav');

      if (toggle && nav) {
        toggle.addEventListener('click', () => {
          nav.classList.toggle('active');
          toggle.classList.toggle('active');

          // Track mobile menu interaction
          GA4.trackEvent(
            'mobile_menu_toggle',
            'navigation',
            'mobile_menu',
            nav.classList.contains('active') ? 1 : 0
          );
        });
      }
    },

    setupSmoothScroll: function () {
      const links = $all('a[href^="#"]');

      links.forEach((link) => {
        link.addEventListener('click', function (e) {
          const target = $(this.getAttribute('href'));
          if (target) {
            e.preventDefault();

            const headerHeight = $('.rw-header')
              ? $('.rw-header').offsetHeight
              : 0;
            const targetPosition = target.offsetTop - headerHeight - 20;

            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });

            GA4.trackEvent(
              'smooth_scroll',
              'navigation',
              'internal_link',
              this.textContent.trim()
            );
          }
        });
      });
    },

    highlightActiveSection: function () {
      const sections = $all('section[id]');
      const navLinks = $all('.rw-nav-link');

      function highlightCurrent() {
        const scrollPosition = window.scrollY + 100;

        sections.forEach((section) => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          const sectionId = section.getAttribute('id');

          if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
          ) {
            navLinks.forEach((link) => {
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
      const header = $('.rw-header');
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
  const Modal = {
    active: null,

    show: function (content, options) {
      options = options || {};

      // Close existing modal
      this.hide();

      const modal = document.createElement('div');
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
      const closeBtn = $('.rw-modal-close', modal);
      const overlay = $('.rw-modal-overlay', modal);

      const closeHandler = this.hide.bind(this);
      if (closeBtn) closeBtn.addEventListener('click', closeHandler);
      if (overlay)
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) closeHandler();
        });

      // ESC key handler
      const escHandler = function (e) {
        if (e.key === 'Escape') {
          closeHandler();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);

      this.active = modal;

      // Trigger animation
      setTimeout(() => {
        modal.classList.add('show');
      }, 100);

      // Track modal view
      GA4.trackEvent(
        'modal_view',
        'engagement',
        'modal_opened',
        options.category || 'general'
      );

      return modal;
    },

    hide: function () {
      if (!this.active) return;

      const modal = this.active;
      modal.classList.remove('show');

      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
        document.body.classList.remove('modal-open');
      }, 300);

      this.active = null;
    },

    confirm: function (message, options) {
      options = options || {};
      const confirmText = options.confirmText || 'Confirm';
      const cancelText = options.cancelText || 'Cancel';

      const content = `
        <div class="rw-modal-body">
          <h3>${options.title || 'Confirm Action'}</h3>
          <p>${message}</p>
          <div class="rw-modal-actions">
            <button class="rw-btn rw-btn-secondary rw-modal-cancel" type="button">${cancelText}</button>
            <button class="rw-btn rw-btn-primary rw-modal-confirm" type="button">${confirmText}</button>
          </div>
        </div>
      `;

      return new Promise((resolve) => {
        const modal = Modal.show(content);

        $('.rw-modal-confirm', modal).addEventListener('click', () => {
          Modal.hide();
          resolve(true);
        });

        $('.rw-modal-cancel', modal).addEventListener('click', () => {
          Modal.hide();
          resolve(false);
        });
      });
    }
  };

  // ================================
  // FORM HANDLING SYSTEM
  // ================================
  const Forms = {
    init: function () {
      this.setupValidation();
      this.setupAsyncSubmission();
      this.setupStripeForms();
    },

    setupValidation: function () {
      const forms = $all('form[data-validate]');

      forms.forEach((form) => {
        const inputs = $all(
          'input[required], textarea[required], select[required]',
          form
        );

        inputs.forEach((input) => {
          input.addEventListener('blur', Forms.validateField.bind(null, input));
          input.addEventListener(
            'input',
            Forms.clearFieldError.bind(null, input)
          );
        });
      });
    },

    validateField: function (input) {
      const value = input.value.trim();
      const type = input.type;
      const required = input.hasAttribute('required');
      let valid = true;
      let message = '';

      // Required validation
      if (required && !value) {
        valid = false;
        message = 'This field is required';
      }

      // Email validation
      else if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          valid = false;
          message = 'Please enter a valid email address';
        }
      }

      // Phone validation
      else if (type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
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

      const errorElement = input.parentNode.querySelector('.field-error');
      if (errorElement) {
        errorElement.remove();
      }

      if (!isValid && message) {
        const error = document.createElement('div');
        error.className = 'field-error';
        error.textContent = message;
        input.parentNode.appendChild(error);
      }
    },

    clearFieldError: function (input) {
      input.classList.remove('invalid');
      const errorElement = input.parentNode.querySelector('.field-error');
      if (errorElement) {
        errorElement.remove();
      }
    },

    setupAsyncSubmission: function () {
      const forms = $all('form[data-async]');

      forms.forEach((form) => {
        form.addEventListener(
          'submit',
          Forms.handleAsyncSubmit.bind(null, form)
        );
      });
    },

    handleAsyncSubmit: function (form, e) {
      e.preventDefault();

      const submitBtn = $('button[type="submit"]', form);
      const originalText = submitBtn ? submitBtn.textContent : '';

      // Validate all fields
      const inputs = $all(
        'input[required], textarea[required], select[required]',
        form
      );
      let isValid = true;

      inputs.forEach((input) => {
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
      const data = serializeForm(form);

      // Determine endpoint
      const action = form.getAttribute('action');
      const method = form.getAttribute('method') || 'POST';

      // Submit form
      safeFetch(action, {
        method: method,
        body: JSON.stringify(data)
      })
        .then((response) => {
          return response.json();
        })
        .then((result) => {
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
        .catch((error) => {
          showToast('Network error: ' + error.message, 'error');
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        });
    },

    setupStripeForms: function () {
      const forms = $all('form[data-stripe]');

      forms.forEach((form) => {
        form.addEventListener(
          'submit',
          Forms.handleStripeSubmit.bind(null, form)
        );
      });
    },

    handleStripeSubmit: function (form, e) {
      e.preventDefault();

      const submitBtn = $('button[type="submit"]', form);
      const originalText = submitBtn ? submitBtn.textContent : '';

      // Get Stripe public key from data attribute
      const publicKey = form.getAttribute('data-stripe-public');
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
      setTimeout(() => {
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
  // SEAT COUNT SYSTEM (DISABLED)
  // ================================
  const SeatCount = {
    current: 0,
    refreshTimer: null,
    init: function () {
      // DISABLED: API endpoint not available - causing CORS errors
      // Re-enable when backend API is ready
      this.update(0); // Use static value for now
      // this.refresh();
      // this.startAutoRefresh();
    },

    refresh: function () {
      // DISABLED: API call commented out to prevent CORS errors
      /*
      safeFetchJSON(CONFIG.SEAT_ENDPOINT)
        .then(function (data) {
          SeatCount.update(data.count || 0);
        })
        .catch(function (error) {
          // Silently fail - don't spam console with API errors
          // Only show in development mode
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.debug("Seat count API not available (expected in development):", error.message);
          }
        });
      */
    },

    update: function (count) {
      this.current = count;

      const displays = $all('[data-seat-count]');
      displays.forEach((display) => {
        display.textContent = count.toLocaleString();
      });

      GA4.trackSeatView(count);
    },

    startAutoRefresh: function () {
      // DISABLED: Auto-refresh commented out to prevent API calls
      // this.refreshTimer = setInterval(function () {
      //   SeatCount.refresh();
      // }, CONFIG.SEAT_REFRESH_INTERVAL);
    },

    stopAutoRefresh: function () {
      // DISABLED: Auto-refresh functionality
      // if (this.refreshTimer) {
      //   clearInterval(this.refreshTimer);
      //   this.refreshTimer = null;
      // }
    }
  };

  // ================================
  // SCROLL ANIMATIONS
  // ================================
  const ScrollAnimations = {
    init: function () {
      if ('IntersectionObserver' in window) {
        this.setupIntersectionObserver();
      } else {
        // Fallback for older browsers
        this.setupScrollListener();
      }
    },

    setupIntersectionObserver: function () {
      const observer = new IntersectionObserver(
        ((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-in');
              observer.unobserve(entry.target);
            }
          });
        }),
        {
          threshold: 0.1,
          rootMargin: '50px'
        }
      );

      const elements = $all('[data-animate]');
      elements.forEach((element) => {
        observer.observe(element);
      });
    },

    setupScrollListener: function () {
      const elements = $all('[data-animate]');

      function checkAnimations() {
        elements.forEach((element) => {
          if (element.classList.contains('animate-in')) return;

          const elementTop = element.getBoundingClientRect().top;
          const windowHeight = window.innerHeight;

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
  const ImageLoader = {
    init: function () {
      const images = $all('img[data-fallback]');
      images.forEach(this.setupImage.bind(this));
    },

    setupImage: function (img) {
      const fallback = img.getAttribute('data-fallback');

      img.addEventListener('error', () => {
        if (fallback && img.src !== fallback) {
          img.src = fallback;
        }
      });

      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
    }
  };

  // ================================
  // ANALYTICS & TIMING
  // ================================
  const Analytics = {
    startTime: Date.now(),
    scrollTracked: new Set(),

    init: function () {
      this.trackScrollPercentages();
      this.trackTimeOnPage();
      this.trackUserEngagement();
    },

    trackScrollPercentages: function () {
      const thresholds = [25, 50, 75, 100];

      function checkScroll() {
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);

        thresholds.forEach((threshold) => {
          if (
            scrollPercent >= threshold &&
            !Analytics.scrollTracked.has(threshold)
          ) {
            Analytics.scrollTracked.add(threshold);
            GA4.trackScroll(threshold);
          }
        });
      }

      window.addEventListener('scroll', throttle(checkScroll, 250));
    },

    trackTimeOnPage: function () {
      const intervals = [30, 60, 120, 300]; // seconds

      intervals.forEach((seconds) => {
        setTimeout(() => {
          const timeSpent = Math.round((Date.now() - Analytics.startTime) / 1000);
          GA4.trackTimeOnPage(timeSpent);
        }, seconds * 1000);
      });
    },

    trackUserEngagement: function () {
      const interactions = ['click', 'scroll', 'keydown'];

      interactions.forEach((interaction) => {
        const handler = throttle(() => {
          GA4.trackEvent('user_engagement', 'engagement', interaction, 1);
        }, 5000); // Track max once per 5 seconds

        document.addEventListener(interaction, handler);
      });
    }
  };

  // ================================
  // ERROR BOUNDARY
  // ================================
  const ErrorBoundary = {
    init: function () {
      window.addEventListener('error', this.handleError.bind(this));
      window.addEventListener(
        'unhandledrejection',
        this.handleRejection.bind(this)
      );
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
      GA4.trackEvent(
        'javascript_error',
        'error',
        type + ': ' + (error.message || error.toString()),
        1
      );

      // Could also send to error reporting service
      console.error('RinaWarp Error:', type, error);
    }
  };

  // ================================
  // TESTIMONIALS WIDGET LOADER
  // ================================
  const TestimonialsWidget = {
    testimonials: [
      {
        text: 'RinaWarp Terminal Pro has completely revolutionized my development workflow. The AI-powered suggestions are incredibly accurate, and the multi-model routing means I can work with any LLM seamlessly.',
        name: 'Sarah Kim',
        role: 'Senior Full-Stack Developer',
        initials: 'SK'
      },
      {
        text: 'As someone who manages a team of 15 developers, RinaWarp\'s automation features have saved us hundreds of hours. The deployment pipeline integration is seamless.',
        name: 'Marcus Johnson',
        role: 'Engineering Team Lead',
        initials: 'MJ'
      },
      {
        text: 'The learning curve was practically non-existent. Coming from traditional terminals, I was worried about adapting to an AI-powered environment, but RinaWarp made it natural.',
        name: 'Alex Liu',
        role: 'DevOps Engineer',
        initials: 'AL'
      },
      {
        text: 'RinaWarp\'s speed is unmatched. What used to take me 20 minutes of Googling now takes seconds with the AI assistant. It\'s like having the internet\'s knowledge at my fingertips.',
        name: 'Emma Rodriguez',
        role: 'Backend Developer',
        initials: 'ER'
      },
      {
        text: 'The video creator tool is a game-changer for our marketing team. We can now generate professional-quality videos for our products in minutes instead of hours.',
        name: 'David Thompson',
        role: 'Marketing Director',
        initials: 'DT'
      },
      {
        text: 'Security was my main concern, but RinaWarp\'s encrypted AI communications and local data processing put me at ease. I can use multiple AI models securely.',
        name: 'Catherine Park',
        role: 'Security Engineer',
        initials: 'CP'
      }
    ],

    loadWidget: function(containerId) {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn('Testimonials widget container not found:', containerId);
        return;
      }

      // Create testimonials grid
      const testimonialsGrid = document.createElement('div');
      testimonialsGrid.className = 'rw-testimonials-grid';
      testimonialsGrid.setAttribute('data-animate', '');

      // Add testimonials
      this.testimonials.forEach((testimonial, index) => {
        const testimonialEl = document.createElement('div');
        testimonialEl.className = 'rw-testimonial';
        testimonialEl.setAttribute('data-animate', '');
        
        testimonialEl.innerHTML = `
          <div class="rw-testimonial-text">
            "${testimonial.text}"
          </div>
          <div class="rw-testimonial-author">
            <div class="rw-testimonial-avatar">${testimonial.initials}</div>
            <div class="rw-testimonial-info">
              <div class="rw-testimonial-name">${testimonial.name}</div>
              <div class="rw-testimonial-role">${testimonial.role}</div>
            </div>
          </div>
        `;
        
        testimonialsGrid.appendChild(testimonialEl);
      });

      // Clear container and add testimonials
      container.innerHTML = '';
      container.appendChild(testimonialsGrid);

      // Add animation classes
      setTimeout(() => {
        testimonialsGrid.classList.add('animate-in');
      }, 100);

      console.log('Testimonials widget loaded successfully');
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

    // Load testimonials widget if container exists
    const testimonialsContainer = document.getElementById('rw-testimonials-widget');
    if (testimonialsContainer) {
      TestimonialsWidget.loadWidget('rw-testimonials-widget');
    }

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
    TestimonialsWidget: TestimonialsWidget,
    Forms: Forms,
    SeatCount: SeatCount,
    showToast: showToast,
    Modal: Modal,
    version: CONFIG.VERSION
  };
})(window, document);
