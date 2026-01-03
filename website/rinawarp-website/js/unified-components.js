/**
 * RinaWarp Unified Components JavaScript
 * Mobile menu, animations, and interactive functionality
 */

// Mobile menu toggle functionality
function toggleMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    const body = document.body;
    
    if (overlay.classList.contains('active')) {
        closeMobileMenu();
    } else {
        overlay.classList.add('active');
        body.style.overflow = 'hidden';
        
        // Animate hamburger to X
        const lines = document.querySelectorAll('.hamburger-line');
        lines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
    }
}

function closeMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    const body = document.body;
    
    overlay.classList.remove('active');
    body.style.overflow = '';
    
    // Reset hamburger animation
    const lines = document.querySelectorAll('.hamburger-line');
    lines[0].style.transform = '';
    lines[1].style.opacity = '';
    lines[2].style.transform = '';
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const overlay = document.getElementById('mobileMenuOverlay');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (overlay.classList.contains('active') && 
        !overlay.contains(event.target) && 
        !menuBtn.contains(event.target)) {
        closeMobileMenu();
    }
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Navbar scroll effect
let lastScrollTop = 0;
const navbar = document.querySelector('.rw-unified-nav');

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
    }
    
    // Add background opacity based on scroll
    if (scrollTop > 50) {
        navbar.style.background = 'rgba(5, 6, 10, 0.98)';
    } else {
        navbar.style.background = 'rgba(5, 6, 10, 0.95)';
    }
    
    lastScrollTop = scrollTop;
});

// Music player functionality (placeholder for future implementation)
function toggleMusicPlayer() {
    // Future implementation for music player
    console.log('Music player toggle');
}

// Animation on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) translateX(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// Initialize animations on page load
document.addEventListener('DOMContentLoaded', animateOnScroll);

// Keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    // Close mobile menu with Escape key
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
});

// Performance optimization: debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll handler
function navbarScrollHandler() {
    // Navbar scroll logic is handled above
}

window.removeEventListener('scroll', navbarScrollHandler);
window.addEventListener('scroll', debounce(navbarScrollHandler, 10));