/* ============================================================
   particles.js — Wazid Portfolio
   Lightweight canvas particle system.
   - Matches your cyan (#00d4ff) + purple (#7c3aed) palette
   - Mouse/touch interactive
   - Auto-pauses when tab is hidden (battery friendly)
   - Disabled on mobile (<768px) for performance
   ============================================================ */

(function () {
    'use strict';

    /* ── CONFIG ─────────────────────────────────────── */
    const CFG = {
        count:        80,       // number of particles
        minR:         1,        // min radius px
        maxR:         2.8,      // max radius px
        speed:        0.35,     // base drift speed
        connectDist:  130,      // line draw distance px
        mouseRadius:  120,      // repel radius px
        repelStrength:3.5,      // repel force
        colors: ['#00d4ff', '#7c3aed', '#00aacc', '#5b21b6', '#e6edf3'],
        opacityRange: [0.25, 0.7],
        mobileBreak:  768,      // disable below this width
    };

    /* ── SKIP ON MOBILE ─────────────────────────────── */
    if (window.innerWidth < CFG.mobileBreak) return;

    /* ── CANVAS SETUP ───────────────────────────────── */
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    Object.assign(canvas.style, {
        position:   'fixed',
        top:        '0',
        left:       '0',
        width:      '100%',
        height:     '100%',
        zIndex:     '0',
        pointerEvents: 'none',
        opacity:    '1',
    });

    // Insert as very first child of body so it's behind everything
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');

    let W, H;
    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', () => {
        resize();
        // Don't re-init particles on resize — just clamp positions
        particles.forEach(p => {
            p.x = Math.min(p.x, W);
            p.y = Math.min(p.y, H);
        });
    }, { passive: true });

    /* ── PARTICLE CLASS ─────────────────────────────── */
    class Particle {
        constructor() { this.reset(true); }

        reset(init = false) {
            this.x  = Math.random() * W;
            this.y  = init ? Math.random() * H : (Math.random() > 0.5 ? -5 : H + 5);
            this.r  = CFG.minR + Math.random() * (CFG.maxR - CFG.minR);
            this.vx = (Math.random() - 0.5) * CFG.speed * 2;
            this.vy = (Math.random() - 0.5) * CFG.speed * 2;
            if (Math.abs(this.vx) < 0.05) this.vx = 0.05;
            if (Math.abs(this.vy) < 0.05) this.vy = 0.05;
            this.color   = CFG.colors[Math.floor(Math.random() * CFG.colors.length)];
            this.opacity = CFG.opacityRange[0] + Math.random() * (CFG.opacityRange[1] - CFG.opacityRange[0]);
            // Subtle twinkle
            this.twinkleSpeed = 0.005 + Math.random() * 0.01;
            this.twinkleDir   = Math.random() > 0.5 ? 1 : -1;
        }

        update(mouse) {
            // Twinkle
            this.opacity += this.twinkleSpeed * this.twinkleDir;
            if (this.opacity >= CFG.opacityRange[1]) this.twinkleDir = -1;
            if (this.opacity <= CFG.opacityRange[0]) this.twinkleDir = 1;

            // Mouse repel
            if (mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CFG.mouseRadius && dist > 0) {
                    const force = (CFG.mouseRadius - dist) / CFG.mouseRadius;
                    this.x += (dx / dist) * force * CFG.repelStrength;
                    this.y += (dy / dist) * force * CFG.repelStrength;
                }
            }

            this.x += this.vx;
            this.y += this.vy;

            // Wrap around edges
            if (this.x < -10) this.x = W + 10;
            if (this.x > W + 10) this.x = -10;
            if (this.y < -10) this.y = H + 10;
            if (this.y > H + 10) this.y = -10;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(this.color, this.opacity);
            ctx.fill();
        }
    }

    /* ── HELPERS ────────────────────────────────────── */
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    function drawConnections(particles) {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CFG.connectDist) {
                    const alpha = (1 - dist / CFG.connectDist) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
                    ctx.lineWidth   = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    /* ── INIT PARTICLES ─────────────────────────────── */
    const particles = Array.from({ length: CFG.count }, () => new Particle());

    /* ── MOUSE / TOUCH TRACKING ─────────────────────── */
    const mouse = { x: null, y: null };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('touchmove', (e) => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => {
        mouse.x = null;
        mouse.y = null;
    }, { passive: true });

    /* ── VISIBILITY (pause when tab hidden) ─────────── */
    let paused = false;
    document.addEventListener('visibilitychange', () => {
        paused = document.hidden;
        if (!paused) loop();
    });

    /* ── LIGHT MODE OPACITY ADJUSTMENT ─────────────── */
    function getCanvasOpacity() {
        return document.body.classList.contains('light-mode') ? '0.45' : '1';
    }

    /* ── ANIMATION LOOP ─────────────────────────────── */
    let rafId;
    function loop() {
        if (paused) return;

        canvas.style.opacity = getCanvasOpacity();

        ctx.clearRect(0, 0, W, H);

        drawConnections(particles);

        particles.forEach(p => {
            p.update(mouse);
            p.draw();
        });

        rafId = requestAnimationFrame(loop);
    }

    loop();

    /* ── REDUCED MOTION: stop animation ────────────── */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        cancelAnimationFrame(rafId);
        canvas.style.display = 'none';
    }

})();
