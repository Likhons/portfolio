/* ============================================================
   github.js — Wazid Portfolio
   Live GitHub stats + pinned repos via public GitHub API.
   No token needed for public data (60 req/hour per IP).
   ============================================================ */

(function () {
    'use strict';

    const USERNAME = 'Likhons';
    const API      = 'https://api.github.com';

    /* ── INJECT SECTION INTO DOM ────────────────────── */
    function injectSection() {
        const section = document.createElement('section');
        section.id        = 'github';
        section.className = 'github-section';
        section.innerHTML = `
            <h2 class="heading">GitHub <span>Activity</span></h2>
            <p class="section-subtitle">My open source presence</p>

            <!-- Stats Row -->
            <div class="gh-stats-row" id="gh-stats-row">
                <div class="gh-stat-card" id="gh-repos">
                    <i class='bx bx-book-open'></i>
                    <span class="gh-stat-num">—</span>
                    <span class="gh-stat-label">Public Repos</span>
                </div>
                <div class="gh-stat-card" id="gh-followers">
                    <i class='bx bx-group'></i>
                    <span class="gh-stat-num">—</span>
                    <span class="gh-stat-label">Followers</span>
                </div>
                <div class="gh-stat-card" id="gh-following">
                    <i class='bx bx-user-plus'></i>
                    <span class="gh-stat-num">—</span>
                    <span class="gh-stat-label">Following</span>
                </div>
                <div class="gh-stat-card" id="gh-stars">
                    <i class='bx bx-star'></i>
                    <span class="gh-stat-num">—</span>
                    <span class="gh-stat-label">Total Stars</span>
                </div>
            </div>

            <!-- Repos Grid -->
            <div class="gh-repos-grid" id="gh-repos-grid">
                <div class="gh-loading">
                    <span class="gh-loader"></span>
                    <p>Fetching repositories…</p>
                </div>
            </div>

            <!-- GitHub Profile Link -->
            <div class="gh-profile-link">
                <a href="https://github.com/${USERNAME}" target="_blank" rel="noopener" class="btn">
                    <i class='bx bxl-github'></i> View Full Profile
                </a>
            </div>
        `;

        // Insert BEFORE portfolio section
        const portfolio = document.getElementById('portfolio');
        if (portfolio) {
            portfolio.parentNode.insertBefore(section, portfolio);
        } else {
            document.body.appendChild(section);
        }
    }

    /* ── FETCH USER PROFILE ─────────────────────────── */
    async function fetchProfile() {
        const res  = await fetch(`${API}/users/${USERNAME}`);
        if (!res.ok) throw new Error('Profile fetch failed');
        return res.json();
    }

    /* ── FETCH REPOS ────────────────────────────────── */
    async function fetchRepos() {
        const res = await fetch(
            `${API}/users/${USERNAME}/repos?sort=updated&per_page=6&type=public`
        );
        if (!res.ok) throw new Error('Repos fetch failed');
        return res.json();
    }

    /* ── COUNT TOTAL STARS ──────────────────────────── */
    function totalStars(repos) {
        return repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    }

    /* ── ANIMATED COUNTER ───────────────────────────── */
    function animateCount(el, target, duration = 1000) {
        const start = performance.now();
        const from  = 0;
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = Math.round(from + (target - from) * ease);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* ── RENDER STATS ───────────────────────────────── */
    function renderStats(profile, repos) {
        const cards = {
            'gh-repos':     { val: profile.public_repos },
            'gh-followers': { val: profile.followers },
            'gh-following': { val: profile.following },
            'gh-stars':     { val: totalStars(repos) },
        };

        Object.entries(cards).forEach(([id, { val }]) => {
            const card   = document.getElementById(id);
            if (!card) return;
            const numEl  = card.querySelector('.gh-stat-num');
            // Animate when card enters viewport
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        animateCount(numEl, val);
                        obs.disconnect();
                    }
                });
            }, { threshold: 0.3 });
            obs.observe(card);
        });
    }

    /* ── LANGUAGE COLOR MAP ─────────────────────────── */
    const LANG_COLORS = {
        'HTML':       '#e34c26',
        'CSS':        '#563d7c',
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'Python':     '#3572A5',
        'Java':       '#b07219',
        'C++':        '#f34b7d',
        'PHP':        '#4F5D95',
        'default':    '#00d4ff',
    };

    function langColor(lang) {
        return LANG_COLORS[lang] || LANG_COLORS['default'];
    }

    /* ── RENDER REPO CARDS ──────────────────────────── */
    function renderRepos(repos) {
        const grid = document.getElementById('gh-repos-grid');
        if (!grid) return;

        if (!repos.length) {
            grid.innerHTML = '<p class="gh-empty">No public repositories found.</p>';
            return;
        }

        grid.innerHTML = repos.map(repo => `
            <a class="gh-repo-card" href="${repo.html_url}" target="_blank" rel="noopener">
                <div class="gh-repo-top">
                    <i class='bx bx-book-open gh-repo-icon'></i>
                    <h4 class="gh-repo-name">${repo.name}</h4>
                </div>
                <p class="gh-repo-desc">${repo.description || 'No description provided.'}</p>
                <div class="gh-repo-meta">
                    ${repo.language ? `
                        <span class="gh-lang">
                            <span class="gh-lang-dot" style="background:${langColor(repo.language)}"></span>
                            ${repo.language}
                        </span>` : ''}
                    <span class="gh-meta-item">
                        <i class='bx bx-star'></i> ${repo.stargazers_count}
                    </span>
                    <span class="gh-meta-item">
                        <i class='bx bx-git-repo-forked'></i> ${repo.forks_count}
                    </span>
                </div>
            </a>
        `).join('');
    }

    /* ── ERROR STATE ────────────────────────────────── */
    function showError() {
        const grid = document.getElementById('gh-repos-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="gh-error">
                    <i class='bx bx-wifi-off'></i>
                    <p>Could not load GitHub data. <a href="https://github.com/${USERNAME}" target="_blank">Visit profile →</a></p>
                </div>
            `;
        }
        // Set stats to N/A
        document.querySelectorAll('.gh-stat-num').forEach(el => el.textContent = '—');
    }

    /* ── MAIN ───────────────────────────────────────── */
    async function init() {
        injectSection();
        injectStyles();

        try {
            const [profile, repos] = await Promise.all([fetchProfile(), fetchRepos()]);
            renderStats(profile, repos);
            renderRepos(repos);
        } catch (err) {
            console.warn('GitHub API error:', err);
            showError();
        }
    }

    /* ── INJECT CSS ─────────────────────────────────── */
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
        /* ===== GITHUB SECTION ===== */
        .github-section {
            background: var(--bg-color);
            position: relative;
            z-index: 1;
        }

        /* Stats row */
        .gh-stats-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem;
            margin-bottom: 5rem;
        }

        .gh-stat-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.8rem;
            padding: 3rem 2rem;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 1.8rem;
            text-align: center;
            transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
            cursor: default;
        }

        .gh-stat-card:hover {
            border-color: var(--main-color);
            transform: translateY(-6px);
            box-shadow: 0 14px 35px rgba(0,212,255,0.18);
        }

        .gh-stat-card i {
            font-size: 3.2rem;
            color: var(--main-color);
        }

        .gh-stat-num {
            font-size: 3.6rem;
            font-weight: 800;
            color: var(--text-color);
            line-height: 1;
            font-family: 'Poppins', sans-serif;
        }

        .gh-stat-label {
            font-size: 1.3rem;
            color: var(--text-muted);
            font-family: 'Poppins', sans-serif;
        }

        /* Repos grid */
        .gh-repos-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
            margin-bottom: 4rem;
        }

        .gh-repo-card {
            display: flex;
            flex-direction: column;
            gap: 1.2rem;
            padding: 2.5rem;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 1.5rem;
            text-decoration: none;
            color: var(--text-color);
            transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
            position: relative;
            overflow: hidden;
        }

        .gh-repo-card::before {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 60%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(0,212,255,0.05), transparent);
            transition: left 0.5s ease;
        }

        .gh-repo-card:hover::before { left: 150%; }

        .gh-repo-card:hover {
            border-color: var(--main-color);
            transform: translateY(-5px);
            box-shadow: 0 14px 35px rgba(0,212,255,0.15);
        }

        .gh-repo-top {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .gh-repo-icon {
            font-size: 2rem;
            color: var(--main-color);
            flex-shrink: 0;
        }

        .gh-repo-name {
            font-size: 1.6rem;
            font-weight: 600;
            color: var(--main-color);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: 'Poppins', sans-serif;
        }

        .gh-repo-desc {
            font-size: 1.35rem;
            color: var(--text-muted);
            line-height: 1.6;
            flex-grow: 1;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            font-family: 'Poppins', sans-serif;
        }

        .gh-repo-meta {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            flex-wrap: wrap;
        }

        .gh-lang {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.25rem;
            color: var(--text-muted);
            font-family: 'Poppins', sans-serif;
        }

        .gh-lang-dot {
            width: 1.1rem;
            height: 1.1rem;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .gh-meta-item {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 1.25rem;
            color: var(--text-muted);
            font-family: 'Poppins', sans-serif;
        }

        .gh-meta-item i { font-size: 1.5rem; }

        /* Loading */
        .gh-loading {
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            padding: 5rem;
            color: var(--text-muted);
            font-size: 1.5rem;
            font-family: 'Poppins', sans-serif;
        }

        .gh-loader {
            width: 3.5rem;
            height: 3.5rem;
            border: 3px solid var(--border-color);
            border-top-color: var(--main-color);
            border-radius: 50%;
            animation: ghSpin 0.8s linear infinite;
        }

        @keyframes ghSpin {
            to { transform: rotate(360deg); }
        }

        /* Error */
        .gh-error {
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            padding: 4rem;
            color: var(--text-muted);
            font-size: 1.5rem;
            font-family: 'Poppins', sans-serif;
        }

        .gh-error i { font-size: 4rem; color: var(--text-muted); }
        .gh-error a { color: var(--main-color); }

        /* Profile link */
        .gh-profile-link {
            display: flex;
            justify-content: center;
            margin-top: 1rem;
        }

        /* Responsive */
        @media (max-width: 991px) {
            .gh-stats-row { grid-template-columns: repeat(2, 1fr); }
            .gh-repos-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 540px) {
            .gh-stats-row { grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
            .gh-repos-grid { grid-template-columns: 1fr; }
            .gh-stat-num { font-size: 2.8rem; }
        }

        /* Light mode */
        body.light-mode .gh-stat-card,
        body.light-mode .gh-repo-card {
            background: #fff;
            border-color: #e2e8f0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        body.light-mode .gh-stat-card:hover,
        body.light-mode .gh-repo-card:hover {
            border-color: var(--main-color);
            box-shadow: 0 14px 35px rgba(2,132,199,0.15);
        }

        body.light-mode .gh-stat-num { color: #0f172a; }
        `;
        document.head.appendChild(style);
    }

    /* ── WAIT FOR DOM ───────────────────────────────── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
