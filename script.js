/* ============================================================
   PORTFOLIO — script.js (updated)
   ============================================================ */

/* ===== LOADING SCREEN ===== */
const loader = document.getElementById('loader');

window.addEventListener('load', () => {
    // Wait for loader bar animation to finish, then hide
    setTimeout(() => {
        if (loader) loader.classList.add('hidden');
        document.body.classList.add('loaded');
        // Trigger page-in transition
        triggerPageIn();
    }, 1700);
});

/* ===== PAGE TRANSITION ===== */
const pageTransition = document.getElementById('page-transition');

function triggerPageIn() {
    if (!pageTransition) return;
    pageTransition.classList.add('slide-out');
    pageTransition.addEventListener('animationend', () => {
        pageTransition.classList.remove('slide-out');
    }, { once: true });
}

// Intercept internal anchor link clicks for smooth transition
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target || !pageTransition) return;
        // No full-page transition for same-page anchors — just smooth scroll
        // (kept for future multi-page use)
    });
});

/* ===== MOBILE NAVBAR TOGGLE ===== */
const menuIcon = document.querySelector('#menu-icon');
const navbar   = document.querySelector('.navbar');

function closeNavbar() {
    navbar.classList.remove('active');
    const icon = menuIcon.querySelector('i');
    icon.classList.remove('bx-x');
    icon.classList.add('bx-menu');
    // Re-enable body scroll
    document.body.style.overflow = '';
}

function openNavbar() {
    navbar.classList.add('active');
    const icon = menuIcon.querySelector('i');
    icon.classList.remove('bx-menu');
    icon.classList.add('bx-x');
    // Lock body scroll while menu is open
    document.body.style.overflow = 'hidden';
}

if (menuIcon) {
    menuIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navbar.classList.contains('active')) {
            closeNavbar();
        } else {
            openNavbar();
        }
    });
}

// Close when any nav link is clicked
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', closeNavbar);
});

// Close when tapping outside navbar on mobile
document.addEventListener('click', (e) => {
    if (
        navbar.classList.contains('active') &&
        !navbar.contains(e.target) &&
        !menuIcon.contains(e.target)
    ) {
        closeNavbar();
    }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navbar.classList.contains('active')) {
        closeNavbar();
    }
});

// Swipe left on mobile to close navbar
let touchStartX = 0;
document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const deltaX = touchStartX - e.changedTouches[0].screenX;
    // Swipe left (deltaX > 60) closes menu
    if (deltaX > 60 && navbar.classList.contains('active')) {
        closeNavbar();
    }
}, { passive: true });

/* ===== STICKY HEADER + ACTIVE NAV ON SCROLL ===== */
const header   = document.querySelector('.header');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('header nav a');

let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Sticky header
    header.classList.toggle('sticky', scrollY > 80);

    // Hide header on fast scroll down, show on scroll up (mobile UX trick)
    if (scrollY > 300) {
        if (scrollY > lastScrollY + 5) {
            // Scrolling down fast — hide header only if navbar is closed
            if (!navbar.classList.contains('active')) {
                header.style.transform = 'translateY(-100%)';
            }
        } else if (lastScrollY > scrollY + 5) {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
    } else {
        header.style.transform = 'translateY(0)';
    }
    lastScrollY = scrollY;

    // Active nav link
    let current = '';
    sections.forEach(sec => {
        if (scrollY >= sec.offsetTop - 250) {
            current = sec.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });

    // Scroll progress bar
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollY / totalHeight) * 100;
    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = progress + '%';

}, { passive: true });

/* ===== CUSTOM SCROLL REVEAL (replaces ScrollReveal library) ===== */
const revealEls = document.querySelectorAll(
    '.home-greeting, .home-content h1, .home-content h3, .home-desc, ' +
    '.home-buttons, .social-media, .home-img, ' +
    '.about-img, .about-content, ' +
    '.skill-item, .tool-card, ' +
    '.services-box, ' +
    '.portfolio-box, ' +
    '.contact-info-item, .contact-form, ' +
    '.heading, .section-subtitle, ' +
    '.stat-box, .footer-content > *'
);

// Add base reveal class
revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    // Directional hints
    if (
        el.closest('.about-img') ||
        el.classList.contains('about-img') ||
        el.closest('.contact-info-item') ||
        el.classList.contains('contact-info-item')
    ) {
        el.classList.add('from-left');
    } else if (
        el.closest('.home-img') ||
        el.classList.contains('home-img') ||
        el.closest('.contact-form') ||
        el.classList.contains('contact-form')
    ) {
        el.classList.add('from-right');
    }
});

// Stagger for grids
document.querySelectorAll(
    '.services-container, .portfolio-container, .about-stats, .tools-grid'
).forEach(container => {
    container.classList.add('reveal-stagger');
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
    revealObserver.observe(el);
});

/* ===== SKILL BARS ANIMATION ===== */
const skillsSection = document.querySelector('.skills');

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.skill-progress').forEach(bar => {
                bar.style.width = bar.getAttribute('data-width') + '%';
            });
            skillObserver.disconnect();
        }
    });
}, { threshold: 0.3 });

if (skillsSection) skillObserver.observe(skillsSection);

/* ===== PORTFOLIO FILTER ===== */
const filterBtns    = document.querySelectorAll('.filter-btn');
const portfolioBoxes = document.querySelectorAll('.portfolio-box');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        portfolioBoxes.forEach(box => {
            const matches = filter === 'all' || box.getAttribute('data-category') === filter;
            if (matches) {
                box.classList.remove('hidden');
                box.style.animation = 'none';
                // Force reflow then animate
                void box.offsetWidth;
                box.style.animation = 'fadeIn 0.4s ease forwards';
            } else {
                box.classList.add('hidden');
            }
        });
    });
});

/* ===== TYPED.JS ===== */
if (typeof Typed !== 'undefined') {
    new Typed('.multiple-text', {
        strings: ['Frontend Developer', 'UI/UX Enthusiast', 'YouTuber', 'CSE Student'],
        typeSpeed: 80,
        backSpeed: 55,
        backDelay: 1600,
        loop: true,
        smartBackspace: true
    });
}

/* ===== CONTACT FORM FEEDBACK ===== */
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function () {
        const btn = this.querySelector('input[type="submit"]');
        if (!btn) return;
        btn.value   = 'Sending…';
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';
        setTimeout(() => {
            btn.value = 'Send Message';
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        }, 4000);
    });
}

/* ===== DARK / LIGHT MODE TOGGLE ===== */
const themeToggle = document.querySelector('#theme-toggle');
const themeIcon   = document.querySelector('#theme-icon');
const body        = document.body;

// Load saved preference
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    body.classList.add('light-mode');
    if (themeIcon) themeIcon.classList.replace('bx-moon', 'bx-sun');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        themeToggle.classList.add('spin');
        themeToggle.addEventListener('animationend', () => {
            themeToggle.classList.remove('spin');
        }, { once: true });

        body.classList.toggle('light-mode');
        const isLight = body.classList.contains('light-mode');

        if (themeIcon) {
            themeIcon.classList.replace(isLight ? 'bx-moon' : 'bx-sun', isLight ? 'bx-sun' : 'bx-moon');
        }

        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
}

/* ===== CURSOR GLOW (desktop only) ===== */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.classList.add('cursor-glow');
    document.body.appendChild(cursor);

    let cursorX = 0, cursorY = 0;
    let raf;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        if (!raf) {
            raf = requestAnimationFrame(() => {
                cursor.style.left = cursorX + 'px';
                cursor.style.top  = cursorY + 'px';
                raf = null;
            });
        }
    });

    // Enlarge cursor on hover over interactive elements
    document.querySelectorAll('a, button, .btn, .tool-card, .portfolio-box, .filter-btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(2)';
            cursor.style.opacity = '0.5';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.opacity = '1';
        });
    });
}

/* ===== TOUCH — ADD ACTIVE STATE FOR CARDS ===== */
document.querySelectorAll('.services-box, .tool-card, .stat-box, .portfolio-box').forEach(card => {
    card.addEventListener('touchstart', () => {
        card.style.transform = 'scale(0.97)';
    }, { passive: true });
    card.addEventListener('touchend', () => {
        setTimeout(() => { card.style.transform = ''; }, 200);
    }, { passive: true });
});
