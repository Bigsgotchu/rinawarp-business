/**
 * RinaWarp Security Utilities
 * Critical security functions for XSS prevention and input sanitization
 */

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized input safe for HTML insertion
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return String(input);
    }
    
    return input
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/`/g, '&#x60;')
        .replace(/=/g, '&#x3D;');
}

/**
 * Creates a safe DOM element with sanitized content
 * @param {string} tag - HTML tag name
 * @param {string} content - Content to insert (will be sanitized)
 * @param {Object} attributes - HTML attributes (keys and values will be sanitized)
 * @returns {HTMLElement} - Safe DOM element
 */
function createSafeElement(tag, content = '', attributes = {}) {
    const element = document.createElement(tag);
    
    // Sanitize and set content safely
    if (content) {
        element.textContent = content;
    }
    
    // Sanitize attributes
    for (const [key, value] of Object.entries(attributes)) {
        const sanitizedKey = sanitizeInput(key);
        const sanitizedValue = sanitizeInput(String(value));
        element.setAttribute(sanitizedKey, sanitizedValue);
    }
    
    return element;
}

/**
 * Safe innerHTML replacement with content sanitization
 * @param {HTMLElement} element - DOM element to update
 * @param {string} html - HTML content (will be sanitized)
 */
function safeInnerHTML(element, html) {
    if (typeof html !== 'string') {
        html = String(html);
    }
    
    // Create a temporary div to parse and sanitize the HTML
    const tempDiv = document.createElement('div');
    tempDiv.textContent = html; // This escapes HTML special characters
    
    element.innerHTML = tempDiv.innerHTML;
}

/**
 * Validates and sanitizes email addresses
 * @param {string} email - Email to validate
 * @returns {string|null} - Sanitized email or null if invalid
 */
function sanitizeEmail(email) {
    if (typeof email !== 'string') return null;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = email.trim().toLowerCase();
    
    return emailRegex.test(sanitized) ? sanitized : null;
}

/**
 * Validates and sanitizes URLs
 * @param {string} url - URL to validate
 * @returns {string|null} - Sanitized URL or null if invalid
 */
function sanitizeUrl(url) {
    if (typeof url !== 'string') return null;
    
    try {
        const urlObj = new URL(url);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return null;
        }
        return urlObj.href;
    } catch {
        return null;
    }
}

/**
 * Rate limiting utility for form submissions
 */
class RateLimiter {
    constructor(maxAttempts = 5, timeWindow = 60000) {
        this.maxAttempts = maxAttempts;
        this.timeWindow = timeWindow;
        this.attempts = new Map();
    }
    
    canAttempt(identifier) {
        const now = Date.now();
        const userAttempts = this.attempts.get(identifier) || [];
        
        // Remove old attempts outside the time window
        const validAttempts = userAttempts.filter(time => now - time < this.timeWindow);
        
        if (validAttempts.length >= this.maxAttempts) {
            return false;
        }
        
        validAttempts.push(now);
        this.attempts.set(identifier, validAttempts);
        return true;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sanitizeInput,
        createSafeElement,
        safeInnerHTML,
        sanitizeEmail,
        sanitizeUrl,
        RateLimiter
    };
}