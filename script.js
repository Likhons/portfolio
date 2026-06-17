/* ===== NAVBAR TOGGLE ===== */
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');

menuIcon.addEventListener('click', () => {
    const icon = menuIcon.querySelector('i');
    navbar.classList.toggle('active');
    icon.classList.toggle('bx-x');
    icon.classList.toggle('bx-menu');
});

// Close navbar when a link is clicked
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', () => {
        navbar.classList.remove('active');
        const icon = menuIcon.querySelector('i');
        icon.classList.remove('bx-x');
        icon.classList.add('bx-menu');
    });
});

/* ===== STICKY HEADER + ACTIVE NAV ON SCROLL ===== */
const header = document.querySelector('.header');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('header nav a');

window.addEventListener('scroll', () => {
    // Sticky header
    header.classList.toggle('sticky', window.scrollY > 80);

    // Active nav link
    let current = '';
    sections.forEach(sec => {
        const sectionTop = sec.offsetTop - 200;
        if (window.scrollY >= sectionTop) {
            current = sec.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

/* ===== SKILL BARS ANIMATION ===== */
// Animate when skills section enters viewport
const skillsSection = document.querySelector('.skills');

const animateSkills = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.skill-progress').forEach(bar => {
                const targetWidth = bar.getAttribute('data-width');
                bar.style.width = targetWidth + '%';
            });
            skillObserver.unobserve(skillsSection); // animate only once
        }
    });
};

const skillObserver = new IntersectionObserver(animateSkills, {
    threshold: 0.3
});

if (skillsSection) {
    skillObserver.observe(skillsSection);
}

/* ===== PORTFOLIO FILTER ===== */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioBoxes = document.querySelectorAll('.portfolio-box');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        portfolioBoxes.forEach(box => {
            if (filter === 'all' || box.getAttribute('data-category') === filter) {
                box.classList.remove('hidden');
                box.style.animation = 'fadeIn 0.4s ease forwards';
            } else {
                box.classList.add('hidden');
            }
        });
    });
});

/* ===== SCROLL REVEAL ===== */
const sr = ScrollReveal({
    distance: '60px',
    duration: 1800,
    delay: 200,
    reset: false
});

sr.reveal('.home-greeting, .home-content h1, .home-content h3, .section-subtitle', {
    origin: 'top', interval: 100
});

sr.reveal('.home-img', { origin: 'right' });
sr.reveal('.home-desc, .home-buttons, .social-media', { origin: 'bottom', interval: 100 });

sr.reveal('.about-img', { origin: 'left' });
sr.reveal('.about-content', { origin: 'right' });

sr.reveal('.skill-item', { origin: 'left', interval: 100 });
sr.reveal('.tool-card', { origin: 'bottom', interval: 80 });

sr.reveal('.services-box', { origin: 'bottom', interval: 150 });
sr.reveal('.portfolio-box', { origin: 'bottom', interval: 100 });
sr.reveal('.contact-info-item', { origin: 'left', interval: 100 });
sr.reveal('.contact-form', { origin: 'right' });

sr.reveal('.heading', { origin: 'top' });

/* ===== TYPED.JS ===== */
const typed = new Typed('.multiple-text', {
    strings: ['Frontend Developer', 'UI/UX Enthusiast', 'YouTuber', 'CSE Student'],
    typeSpeed: 80,
    backSpeed: 60,
    backDelay: 1500,
    loop: true,
    smartBackspace: true
});

/* ===== SMOOTH CONTACT FORM FEEDBACK ===== */
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        const btn = this.querySelector('input[type="submit"]');
        btn.value = 'Sending...';
        btn.style.opacity = '0.7';
        // Formspree handles the actual submit
        // Re-enable after 3s as fallback
        setTimeout(() => {
            btn.value = 'Send Message';
            btn.style.opacity = '1';
        }, 3000);
    });
}

/* ===== DARK / LIGHT MODE TOGGLE ===== */
const themeToggle = document.querySelector('#theme-toggle');
const themeIcon   = document.querySelector('#theme-icon');
const body        = document.body;

// Load saved preference (default = dark)
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    body.classList.add('light-mode');
    themeIcon.classList.replace('bx-moon', 'bx-sun');
}

themeToggle.addEventListener('click', () => {
    // Spin animation
    themeToggle.classList.add('spin');
    themeToggle.addEventListener('animationend', () => {
        themeToggle.classList.remove('spin');
    }, { once: true });

    // Toggle class
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');

    // Swap icon
    if (isLight) {
        themeIcon.classList.replace('bx-moon', 'bx-sun');
    } else {
        themeIcon.classList.replace('bx-sun', 'bx-moon');
    }

    // Save to localStorage
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});