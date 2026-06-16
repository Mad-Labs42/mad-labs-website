# Adversarial Multi-Perspective Audit — Execution Plan

**Date:** 2026-06-15
**Environment:** http://localhost:4321/ (Astro 5 dev server)
**Branch:** main (dirty — Phase 1 & 2 work in progress)
**Methodology:** Master Thinking Planning Protocol + Prism-Full + Adversarial UX Test

---

## Domains of Analysis (Prism-Discover)

1. **Architectural Integrity** — Component coupling, state management, CSS cascade, dead code
2. **Build & Tooling** — Astro config, build output, asset pipeline, bundler warnings
3. **Accessibility (WCAG 2.1 AA/AAA)** — Keyboard nav, screen reader, contrast, focus, motion
4. **Performance (Core Web Vitals)** — CLS, LCP, FCP, bundle size, font loading
5. **Security & Compliance** — CSP, SRI, form security, env exposure, XSS vectors
6. **SEO & Structured Data** — Schema.org, meta tags, heading hierarchy, hreflang, robots
7. **Network & Dependency** — External resources, 3rd-party payloads, CDN health
8. **Adversarial UX** — Persona-driven friction testing, workflow breaks, misleading UI
9. **Semantic HTML & DOM Hygiene** — Correct element use, nested-interactive violations, ARIA misuse
10. **Mobile & Responsive** — Breakpoint coverage, touch targets, viewport meta, horizontal overflow
11. **Error Recovery & Edge Cases** — JS disabled, 404, widget load failure, offline states
12. **CSS Specificity & Stacking Contexts** — Cascade depth, z-index wars, containment traps

---

## Phase 0: Preflight — Tool Inventory & Baseline

### Tools Available
- **Chrome DevTools MCP** — 29 CDP tools (audits, coverage, network, storage, a11y tree)
- **Lighthouse MCP** — Quality audits (perf, a11y, best practices, SEO, PWA)
- **Playwright MCP** — 23 tools (interaction, screenshots, console, network)
- **Browser vision** — Screenshot-based visual analysis
- **Hindsight** — Memory recall for context
- **Obsidian** — Knowledge base
- **Terminal** — File inspection, build verification

### MCP Inventory
- [ ] Confirm Chrome DevTools MCP reachable
- [ ] Confirm Lighthouse MCP reachable
- [ ] Confirm Playwright MCP reachable
- [ ] Start hindsight daemon

---

## Phase 1: Architectural Integrity (Prism-Full)

### Pass 1 — Component Coupling & Dependency
- Map every `.astro` component's imports and exports
- Identify circular dependencies or over-coupled modules
- Find components that import the whole world when they need one function

### Pass 2 — State Management & JS Hygiene
- Audit every `<script>` block for: global state, DOM coupling, event listener cleanup
- Find memory leaks (event listeners on removed DOM, stale intervals)
- Check for browser API feature detection before usage

### Pass 3 — CSS Cascade Depth & Specificity Wars
- Map z-index stacking contexts across components
- Find specificity conflicts (nested selectors, !important abuse, data-astro-cid collisions)
- Identify unused/dead CSS

### Pass 4 — Build Output Analysis
- Inspect built HTML for SSR hydration issues
- Check script injection order (critical blocking scripts)
- Verify asset hashing for cache busting

---

## Phase 2: Accessibility (WCAG 2.1 — Full Keyboard Walkthrough)

### Routes to Test
- [ ] Homepage (/)
- [ ] Services (/services)
- [ ] About (/about)
- [ ] Contact (/contact)
- [ ] Thank-you (/contact/thank-you)
- [ ] 404 (/404)

### Test Protocol Per Route
1. **Keyboard navigation** — Tab through every interactive element
2. **Focus visibility** — Every element has visible focus indicator
3. **Skip-to-content** — First Tab press lands on skip link, it's visible
4. **Screen reader** — aria-labels, aria-describedby, alt text, role correctness
5. **Color contrast** — Calculate every text-on-background pair against WCAG AA
6. **Touch targets** — Every interactive element ≥ 44×44px CSS
7. **Reduced motion** — prefers-reduced-motion disables animations
8. **Zoom** — 200% zoom doesn't break layout or cause text truncation

---

## Phase 3: Performance & Core Web Vitals (Lighthouse MCP + CDP)

### CDP-based Measurements
- Network waterfall — blocking scripts, render-blocking resources
- Coverage — unused CSS/JS per page
- Layout shifts — CLS via Performance Observer
- Largest Contentful Paint element — what, when, why

### Lighthouse MCP Audit
- Performance score
- Accessibility score
- Best Practices score
- SEO score
- Specific diagnostics (render-blocking resources, unused CSS, properly sized images)

---

## Phase 4: Security & Compliance

### CSP Audit
- Verify CSP header content vs what the page actually does
- Check report-only vs enforcement mode
- Identify inline scripts/styles not covered by nonce/hash
- Verify frame-src covers all embeds (Zoho, Nimbuspop)

### External Resources
- SRI on all CDN-loaded scripts/styles/fonts
- Cross-origin opens (target="_blank" without rel="noopener")
- Form action endpoints (Zoho CRM POST target)

### Data Exposure
- Environment variables leaked to client
- API keys or internal URLs in source
- Comment-stripping in production build

---

## Phase 5: SEO & Structured Data

### Meta Tag Audit
- Title tag — unique per page, ≤ 60 chars
- Meta description — unique per page, ≤ 160 chars
- OG tags — og:title, og:description, og:image, og:url, og:type
- Twitter cards — summary_large_image where appropriate

### Structured Data
- JSON-LD on homepage (Organization, LocalBusiness, WebSite)
- BreadcrumbList on interior pages
- Service schema on services page

### Heading Hierarchy
- One H1 per page
- No heading level skips (H1→H3 without H2)
- Semantic heading order (not styled divs masquerading as headings)

---

## Phase 6: Adversarial UX Audit

### Persona: "Big Frank" Brennan — 61-year-old small business owner
**Background:** Runs a computer repair shop in Falkirk. Has been fixing PCs since Windows 95. Customer service is done the old way — phone, paper, and knowing everyone in town. His son Tommy (age 24) handles "the website stuff" and convinced him MAD LABS could help with managed IT. Frank has a smartphone but uses it for calls and the football scores. He gets angry when websites make him "jump through hoops" to get a simple answer.

**Tech level:** WhatsApp, BBC Sport app, basic Google. Has an email address he gives out but doesn't check regularly. "If I need to create an account to get a price, I'm going somewhere else."

**Goal:** Get a price for IT support for his shop — he has 6 computers, a server in the back, and the card machine keeps dropping offline.

**Dealbreakers:** 
- Vague pricing (he wants a number, not "contact us")
- Jargon he doesn't understand
- Forms that ask too many questions
- Slow-loading pages
- "Innovative design" that he can't figure out

### Friction Categories to Test
1. **First impression** — Does the landing page tell Frank clearly what MAD LABS does and whether it's for him?
2. **Core workflow** — Can Frank find a price, contact someone, or understand the services?
3. **Error recovery** — What happens when he fills in a form wrong? When the booking widget doesn't load?
4. **Readability** — Font size, contrast, information density for 61-year-old eyes
5. **Terminology** — "CRT terminal aesthetic" to Frank: nonsense or memorable?
6. **Navigation** — Can he find what he needs in ≤ 2 clicks?
7. **Mobile** — He visits on his phone first, then calls from his desktop

---

## Phase 7: Synthesis & Remediation

- Cross-phase findings reconciliation
- Prioritized fix list (ship-blocking → P1 → P2 → P3)
- Updated vault plan
- Hindsight memory storage
- Session dump
