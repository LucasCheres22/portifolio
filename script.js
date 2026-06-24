/* ========================================================
   LUCAS CHERES — PORTFOLIO INTERACTIVE ENGINE
   ======================================================== */

let lenisInstance;

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCursorGlow();
    initScrollProgress();
    initNavScroll();
    initMobileMenu();
    initRevealAnimations();
    initTypewriter();
    initCounterAnimation();
    initActiveNavLink();
    initLenis();
    initTilt();
});

/* ========================================================
   PARTICLE SYSTEM
   ======================================================== */
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0, mouseY = 0;
    let animationId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.targetOpacity = this.opacity;
            this.pulse = Math.random() * Math.PI * 2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.pulse += 0.01;
            this.opacity = this.targetOpacity + Math.sin(this.pulse) * 0.1;

            // Mouse interaction — subtle attraction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                this.speedX += dx * 0.00005;
                this.speedY += dy * 0.00005;
                this.opacity = Math.min(this.opacity + 0.15, 0.7);
            }

            // Damping
            this.speedX *= 0.999;
            this.speedY *= 0.999;

            // Wrap around
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.y < -10) this.y = canvas.height + 10;
            if (this.y > canvas.height + 10) this.y = -10;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 168, 83, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Create particles — scale with screen size
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    const opacity = (1 - dist / 100) * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(212, 168, 83, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        animationId = requestAnimationFrame(animate);
    }

    animate();

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Pause particles when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
}

/* ========================================================
   CURSOR GLOW
   ======================================================== */
function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow || window.matchMedia('(max-width: 768px)').matches) return;

    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    function updateGlow() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        glow.style.left = currentX + 'px';
        glow.style.top = currentY + 'px';
        requestAnimationFrame(updateGlow);
    }

    updateGlow();
}

/* ========================================================
   SCROLL PROGRESS BAR
   ======================================================== */
function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        bar.style.width = progress + '%';
    }, { passive: true });
}

/* ========================================================
   NAV SCROLL EFFECT
   ======================================================== */
function initNavScroll() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;

        if (scrollTop > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScroll = scrollTop;
    }, { passive: true });
}

/* ========================================================
   MOBILE MENU
   ======================================================== */
function initMobileMenu() {
    const hamburger = document.getElementById('navHamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

/* ========================================================
   REVEAL ANIMATIONS (Intersection Observer)
   ======================================================== */
function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal-up');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animations within the same observation batch
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

/* ========================================================
   TYPEWRITER EFFECT
   ======================================================== */
function initTypewriter() {
    const el = document.getElementById('dynamicTagline');
    if (!el) return;

    const phrases = [
        'indústria e inteligência artificial.',
        'dados e decisões de impacto.',
        'eficiência e inovação.',
        'chão de fábrica e algoritmos.',
        'engenharia e software.'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let speed = 60;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            el.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            speed = 30;
        } else {
            el.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            speed = 60;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            speed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            speed = 400; // Pause before new phrase
        }

        setTimeout(type, speed);
    }

    // Start after hero animation
    setTimeout(type, 1500);
}

/* ========================================================
   COUNTER ANIMATION
   ======================================================== */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const duration = 2000;
    const start = performance.now();
    const isFloat = target % 1 !== 0;

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;

        if (isFloat) {
            el.textContent = current.toFixed(1);
        } else {
            el.textContent = Math.floor(current);
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = isFloat ? target.toFixed(1) : target;
        }
    }

    requestAnimationFrame(update);
}

/* ========================================================
   ACTIVE NAV LINK TRACKING
   ======================================================== */
function initActiveNavLink() {
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.dataset.section === id);
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-100px 0px -40% 0px'
    });

    sections.forEach(section => observer.observe(section));
}

/* ========================================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ======================================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            if (lenisInstance) {
                lenisInstance.scrollTo(target, {
                    offset: -80
                });
            } else {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({
                    top: top,
                    behavior: 'smooth'
                });
            }
        }
    });
});

/* ========================================================
   SMOOTH SCROLLING (LENIS)
   ======================================================== */
function initLenis() {
    if (typeof Lenis === 'undefined') return;

    lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false
    });

    function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
}

/* ========================================================
   3D TILT EFFECT (VANILLA-TILT)
   ======================================================== */
function initTilt() {
    if (typeof VanillaTilt === 'undefined') return;

    // Apply 3D Tilt only on non-touch desktop screens for performance
    if (window.innerWidth > 768) {
        VanillaTilt.init(document.querySelectorAll(
            ".detail-card, .achievement-card, .code-window, .skill-category, .goal-card, .model-card, .savings-card, .benefit-item, .contact-card, .chart-card"
        ), {
            max: 5,           // Subtle tilt angle
            speed: 800,       // Fast transition back
            glare: true,      // Elegant glass glare
            "max-glare": 0.12, // Subtle glare opacity
            perspective: 1200 // Elegant 3D perspective depth
        });
    }
}
