/**
 * GDPR-Compliant Cookie Consent Manager
 * Blocks AdSense and other tracking scripts until user consent
 */

(function() {
  'use strict';
  
  const CONSENT_KEY = 'hiit_timer_cookie_consent';
  const CONSENT_VERSION = '1.0';
  
  // Check if consent already exists
  function hasConsent() {
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      if (!consent) return false;
      
      const data = JSON.parse(consent);
      return data.version === CONSENT_VERSION && data.marketing === true;
    } catch (e) {
      return false;
    }
  }
  
  // Load blocked scripts after consent
  function loadBlockedScripts() {
    const scripts = document.querySelectorAll('script[data-consent-required="true"]');
    
    scripts.forEach(function(blockedScript) {
      const newScript = document.createElement('script');
      
      // Copy attributes
      if (blockedScript.dataset.src) {
        newScript.src = blockedScript.dataset.src;
      }
      if (blockedScript.async) {
        newScript.async = true;
      }
      if (blockedScript.crossOrigin) {
        newScript.crossOrigin = blockedScript.crossOrigin;
      }
      
      // Insert into DOM
      document.head.appendChild(newScript);
    });
  }
  
  // Save consent choice
  function saveConsent(marketing) {
    const consent = {
      version: CONSENT_VERSION,
      essential: true,
      marketing: marketing,
      timestamp: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch (e) {
      console.error('Failed to save consent:', e);
    }
  }
  
  // Show consent banner
  function showBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.setAttribute('aria-live', 'polite');
    
    banner.innerHTML = `
      <div class="cookie-consent-content">
        <p class="cookie-consent-text">
          We use cookies to improve your experience and serve personalized ads through Google AdSense. 
          <a href="/privacy.html" class="cookie-consent-link">Learn more</a>
        </p>
        <div class="cookie-consent-buttons">
          <button id="cookie-accept" class="cookie-btn cookie-btn-accept">Accept All</button>
          <button id="cookie-reject" class="cookie-btn cookie-btn-reject">Reject Marketing</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Event listeners
    document.getElementById('cookie-accept').addEventListener('click', function() {
      saveConsent(true);
      banner.remove();
      loadBlockedScripts();
    });
    
    document.getElementById('cookie-reject').addEventListener('click', function() {
      saveConsent(false);
      banner.remove();
      // Don't load marketing scripts
    });
  }
  
  // Withdraw consent (for footer link)
  window.withdrawCookieConsent = function() {
    localStorage.removeItem(CONSENT_KEY);
    location.reload();
  };
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (hasConsent()) {
        loadBlockedScripts();
      } else {
        showBanner();
      }
    });
  } else {
    if (hasConsent()) {
      loadBlockedScripts();
    } else {
      showBanner();
    }
  }
})();
