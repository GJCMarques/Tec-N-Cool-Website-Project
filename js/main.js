// ============================================
// MOBILE MENU
// ============================================
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuBtn = document.getElementById('mobileMenuBtn');
    
    if (navLinks && menuBtn) {
        navLinks.classList.toggle('active');
        menuBtn.classList.toggle('active');
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', !isExpanded);
    }
}

// ============================================
// HEADER SCROLL BEHAVIOR
// ============================================
let lastScroll = 0;

function handleScroll() {
    const header = document.getElementById('header');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    if (currentScroll > lastScroll && currentScroll > 200) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }
    
    lastScroll = currentScroll;
    
    updateScrollToTopButton();
}

// ============================================
// SCROLL TO TOP BUTTON
// ============================================
function initScrollToTopButton() {
    const scrollBtn = document.getElementById('scrollToTopBtn');
    
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

function updateScrollToTopButton() {
    const scrollBtn = document.getElementById('scrollToTopBtn');
    const progressCircle = document.querySelector('.scroll-progress-ring-circle');
    
    if (!scrollBtn || !progressCircle) return;
    
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.pageYOffset;
    const scrollProgress = (scrolled / windowHeight) * 100;
    
    if (scrolled > 200) {
        scrollBtn.classList.add('visible');
    } else {
        scrollBtn.classList.remove('visible');
    }
    
    const circumference = 2 * Math.PI * 26;
    const offset = circumference - (scrollProgress / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('[data-aos]').forEach(el => {
        const delay = el.getAttribute('data-aos-delay');
        if (delay) {
            el.style.transitionDelay = `${delay}ms`;
        }
        observer.observe(el);
    });
}

// ============================================
// PARTICLES ANIMATION
// ============================================
function createParticles() {
    const particlesContainer = document.getElementById('particlesContainer');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(102, 126, 234, ${Math.random() * 0.5 + 0.2})`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.pointerEvents = 'none';
        
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.animation = `particleFloat ${duration}s ${delay}s infinite ease-in-out`;
        
        particlesContainer.appendChild(particle);
    }
    
    // Add animation to stylesheet
    if (!document.getElementById('particle-animation')) {
        const style = document.createElement('style');
        style.id = 'particle-animation';
        style.textContent = `
            @keyframes particleFloat {
                0%, 100% {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================
// CARD HOVER EFFECT
// ============================================
function initCardHoverEffects() {
    const cards = document.querySelectorAll('.category-card');
    
    cards.forEach(card => {
        const hoverEffect = card.querySelector('.card-hover-effect');
        
        card.addEventListener('mousemove', (e) => {
            if (!hoverEffect) return;
            
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            hoverEffect.style.setProperty('--x', x + '%');
            hoverEffect.style.setProperty('--y', y + '%');
        });
    });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const isMobile = window.innerWidth <= 768;
                    const headerHeight = isMobile ? 80 : 100;
                    const extraPadding = 70;
                    const offsetTop = target.offsetTop - headerHeight - extraPadding;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    const navLinks = document.getElementById('navLinks');
                    const menuBtn = document.getElementById('mobileMenuBtn');
                    if (navLinks && menuBtn) {
                        navLinks.classList.remove('active');
                        menuBtn.classList.remove('active');
                        menuBtn.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        });
    });
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================
function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const navLinks = document.getElementById('navLinks');
            const menuBtn = document.getElementById('mobileMenuBtn');
            if (navLinks && menuBtn && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
                menuBtn.focus();
            }
            
            closeLanguageDropdown();
        }
    });
}

// ============================================
// INITIALIZE EVENT LISTENERS
// ============================================
function initEventListeners() {
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Scroll listener
    window.addEventListener('scroll', handleScroll);
}

// ============================================
// INITIALIZE ON DOM LOADED
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initScrollAnimations();
    initSmoothScroll();
    initKeyboardNav();
    initEventListeners();
    initCardHoverEffects();
    initScrollToTopButton();
    setTimeout(createParticles, 500);
    
});