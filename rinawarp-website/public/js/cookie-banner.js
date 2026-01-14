// Cookie Consent Banner

document.addEventListener('DOMContentLoaded', function() {
  // Check if cookie consent has been given
  const cookieConsent = localStorage.getItem('cookie_consent');
  
  if (!cookieConsent) {
    // Create cookie banner
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.innerHTML = `
      <div class="cookie-banner-content">
        <p>We use cookies to enhance your experience, analyze traffic, and serve personalized content. By clicking "Accept", you consent to our use of cookies.</p>
        <div class="cookie-banner-actions">
          <button id="cookie-accept" class="rw-button">Accept</button>
          <button id="cookie-decline" class="rw-button-outline">Decline</button>
          <a href="/privacy.html" class="cookie-banner-link">Privacy Policy</a>
        </div>
      </div>
    `;
    
    // Add banner to body
    document.body.appendChild(banner);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        border-top: 1px solid #e5e7eb;
        padding: 1.5rem;
        box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .cookie-banner-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .cookie-banner-content p {
        margin: 0;
        color: #374151;
        font-size: 0.875rem;
        line-height: 1.5;
      }
      
      .cookie-banner-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      
      .cookie-banner-actions button {
        font-size: 0.875rem;
        padding: 0.5rem 1rem;
      }
      
      .cookie-banner-link {
        font-size: 0.875rem;
        color: #6b7280;
        text-decoration: underline;
        margin-top: 0.25rem;
      }
      
      @media (max-width: 768px) {
        .cookie-banner {
          padding: 1rem;
        }
        
        .cookie-banner-actions {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Add event listeners
    document.getElementById('cookie-accept').addEventListener('click', function() {
      localStorage.setItem('cookie_consent', 'accepted');
      banner.style.display = 'none';
      
      // Track consent
      if (typeof gtag !== 'undefined') {
        gtag('event', 'cookie_consent', { consent: 'accepted' });
      }
      if (typeof window.plausible !== 'undefined') {
        window.plausible('Cookie Consent', { consent: 'accepted' });
      }
    });
    
    document.getElementById('cookie-decline').addEventListener('click', function() {
      localStorage.setItem('cookie_consent', 'declined');
      banner.style.display = 'none';
      
      // Track consent
      if (typeof gtag !== 'undefined') {
        gtag('event', 'cookie_consent', { consent: 'declined' });
      }
      if (typeof window.plausible !== 'undefined') {
        window.plausible('Cookie Consent', { consent: 'declined' });
      }
    });
  }
});