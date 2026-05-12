# MAD LABS Website Principles

## Purpose

This file defines the project-specific design and engineering principles for the MAD LABS website.

These principles are intended to guide implementation, audits, refactors, and polish work. They are not generic web-design rules. They exist to protect the approved MAD LABS direction while improving quality, performance, responsiveness, maintainability, and customer trust.

## Core Directive

Preserve the current MAD LABS CRT/neon/retro-tech identity.

Do not redesign the site into a generic business template. Improve the existing direction by making it faster, smoother, more responsive, more professional, and more trustworthy.

Treat the CRT hero, monitor concept, animation language, neon/purple visual system, playful copy, and retro-tech personality as approved design intent.

Recommend removal or major redesign only when there is clear evidence that the current approach harms usability, performance, accessibility, or maintainability.

Optimize the magic. Do not delete it.

---

## Approved Design Identity

The following are intentional parts of the site identity:

- CRT monitor hero concept
- Neon purple / retro lab visual direction
- Old-school computer repair energy
- Modern AI / smart-tech capability
- Playful but trustworthy MAD LABS voice
- Animated boot sequence
- Power-button interaction
- Glitch, scanline, glow, and terminal-style effects
- Strong “personal tech support” angle
- Local homeowner / work-from-home / gamer / very small business positioning

Do not treat these choices as problems merely because they are more stylized than a standard business site.

---

## Non-Goals

Do not push the site toward:

- Generic SaaS design
- Minimalist corporate design
- Bland repair-shop template design
- Enterprise IT positioning
- React-first architecture
- Heavy client-side JavaScript
- Animation-library dependency creep
- Unnecessary backend complexity
- Overly technical copy that confuses normal customers
- A full public dump of the internal price sheet

---

## Audience and Business Positioning

The site should primarily appeal to:

- Homeowners
- Work-from-home employees
- Gamers
- Solo operators
- Very small businesses, roughly 5–10 employees maximum
- Local Cincinnati-area customers who want practical, personal tech support

The site should communicate confidence without implying enterprise-scale services.

Good positioning includes:

- Computer repair
- Laptop and desktop troubleshooting
- Diagnostics
- Tune-ups
- Hardware upgrades
- Custom PCs
- Wi-Fi and router help
- Printer and device setup
- Backup setup
- Basic cybersecurity setup
- Smart-home setup
- Websites for small businesses
- AI assistant setup
- Light workflow automation
- Website chatbot setup

Avoid implying:

- Enterprise managed IT
- Large-scale corporate automation
- Advanced cybersecurity consulting
- Board-level electronics repair
- Advanced data recovery lab services
- Large multi-user business deployments
- Anything beyond current intended capability

---

## Architecture Principles

### Static First

Prefer static Astro pages and components. The site should remain CDN-friendly and Cloudflare Pages-ready.

Do not introduce backend code, APIs, databases, server logic, or dynamic runtime behavior unless there is a clear business need.

### Astro Native

Prefer `.astro` components for static UI.

Use:

- `src/pages/` for route-level page structure
- `src/layouts/` for shared page shell and metadata
- `src/components/` for reusable UI and visual systems
- `src/styles/global.css` for global tokens, base styles, and shared design language
- `src/data/` for structured reusable content when content becomes too large or repeated

### HTML and CSS Before JavaScript

Use semantic HTML and CSS for layout, presentation, responsiveness, and most animation.

Use JavaScript only for real behavior, such as:

- CRT power state
- animation timeline sequencing
- session-based intro skipping
- deliberate interaction behavior

Do not turn the site into a client-side app.

### No Framework Creep

Do not add React, Vue, Svelte, animation libraries, state libraries, or heavy dependencies unless the benefit is overwhelming and evidence-backed.

---

## Design System Principles

### Preserve the Visual Language

Every page should feel like the same MAD LABS world: retro tech, neon lab, CRT glow, practical repair shop, modern AI capability.

Do not introduce random visual styles that feel copied from another template.

### Design Tokens Over Magic Values

Prefer CSS variables for recurring:

- Colors
- Glow strengths
- Shadows
- Spacing
- Border radii
- Font stacks
- Timing values
- CRT colors
- Bezel colors
- Taskbar colors

One-off values are acceptable for art-directed details, but repeated visual rules should become tokens or clear patterns.

### Hierarchy First

Visitors should quickly understand:

- What MAD LABS does
- Who the service is for
- What services are offered
- What pricing generally starts at
- How to contact MAD LABS

Visual style should support this hierarchy, not compete with it.

### Premium, Not Cluttered

The site can be bold, glowing, animated, and weird in the right ways.

It should not feel crowded, noisy, cheap, or like every effect was turned on at once.

Use restraint inside the style. Let the best moments stand out.

### Readability Beats Flash

Retro fonts, glow, scanlines, and CRT effects must not make the business copy hard to read.

If a visual effect harms readability, tune the effect. Do not remove the brand identity unless tuning cannot solve the problem.

---

## CSS Principles

### Component Containment

Complex CRT effects should stay contained inside the CRT component unless they are truly global brand styles.

Avoid letting hero-specific styles leak into unrelated pages.

### Low-Specificity CSS

Prefer clear class selectors and predictable component-local styles.

Avoid selector wars, unnecessary nesting, and brittle overrides.

### DRY With Judgment

Use shared tokens and repeated patterns where helpful.

Do not create confusing abstractions just to avoid a small amount of duplication in art-directed CSS.

### Explicit State Classes

Animation and UI states should be clearly named.

Good examples:

- `is-loading`
- `is-powering-on`
- `is-atom-revealing`
- `is-title-sequencing`
- `is-divider-building`
- `is-divider-opening`
- `is-major-glitching`
- `is-restoring`
- `is-final-glow`
- `is-stable`
- `is-shutting-down`
- `is-powered-off`

Avoid vague names like:

- `active`
- `active2`
- `new-effect`
- `fix`
- `test-state`

### Avoid Fragile Visual Hacks

Avoid unexplained negative margins, mystery transforms, hidden layout dependencies, and magic positioning that only works at one viewport size.

If a hack is necessary for a visual effect, keep it isolated and explain the intent with a short comment.

---

## Animation Principles

### Animation Must Have Purpose

Every animation should communicate something:

- Booting
- Power state
- Loading
- Glitch
- Reveal
- Arrival
- Emphasis
- Interaction
- System personality

Avoid animation that exists only because it is possible.

### Animation Quality Over Animation Quantity

The current animation direction is approved. The next step is refinement.

Look for:

- Awkward timing gaps
- Visual flashes
- Elements appearing too early
- Elements disappearing too late
- Overlapping state classes
- Janky transform jumps
- Mobile timing/layout issues
- Reduced-motion gaps
- Too many simultaneous forever-running animations

The target feel is cinematic, smooth, controlled, readable, and intentional.

### Prefer Transform and Opacity

Prefer animating:

- `transform`
- `opacity`

Be cautious with:

- `filter`
- `box-shadow`
- `width`
- `height`
- `top`
- `left`
- layout-affecting properties

Heavy effects are allowed when they are important to the art direction, but they should be budgeted and tested.

### Motion Budget

Do not allow every element to animate constantly.

Forever-running effects should be limited to what materially improves the CRT feel.

The site should feel alive, not overheated.

### Reduced Motion Is Required

Major motion sequences need a clean `prefers-reduced-motion` path.

Reduced motion should preserve the brand and content without forcing users through intense flicker, glitching, or long animation sequences.

---

## Performance Principles

### Performance Is Part of the Design

The homepage must feel smooth and professional on first load.

A beautiful hero that stutters badly can damage trust.

### Optimize Without Killing the Magic

Performance work should preserve the CRT identity.

Good optimization:

- Reduce unnecessary animation cost
- Remove dead CSS
- Reduce duplicated selectors
- Improve font loading behavior
- Avoid layout shift
- Tune heavy filters
- Limit constant background work
- Keep JavaScript small
- Keep the site static/CDN-friendly

Bad optimization:

- Remove the CRT hero by default
- Strip all glow and scanline effects
- Replace the site with a generic static hero
- Flatten the brand into a standard corporate layout

### Measure Before Guessing

Prefer evidence from:

- `pnpm check`
- `pnpm build`
- browser inspection
- responsive viewport checks
- Lighthouse/PageSpeed-style reports where available
- visual inspection of first load and animation behavior

Separate measured problems from taste preferences.

### Avoid Layout Shift

Reserve space for major elements.

The CRT, headings, cards, CTAs, and sections should not jump around as fonts, CSS, or scripts load.

### Font Discipline

Use the approved fonts intentionally.

Avoid unnecessary font weights, excessive font imports, and font-loading behavior that causes ugly visual shifts.

---

## TypeScript and JavaScript Principles

### Small Scripts, Clear Ownership

Client scripts should be small and responsible for one behavior area.

The CRT hero script may manage the CRT hero timeline. It should not become a general homepage controller.

### Defensive Browser Code

Guard:

- DOM queries
- `sessionStorage`
- media query access
- custom events
- browser-only APIs

The page should not break if a browser feature is unavailable.

### Clear Event Contracts

Custom events should have clear names and obvious ownership.

Good examples:

- `madlabs:hero-reset`
- `madlabs:hero-title-sequence-start`
- `madlabs:hero-title-glow-start`
- `madlabs:hero-divider-line-build`
- `madlabs:hero-divider-open`

Avoid generic event names.

### Graceful Failure

If JavaScript fails, the page should still show useful content or degrade cleanly.

The homepage should not become a blank CRT screen because one script failed.

---

## UX and Conversion Principles

### Trust Before Cleverness

Visitors need to quickly understand that MAD LABS is professional, local, practical, and safe to contact.

Creative language is welcome, but pricing, services, and calls to action must be clear.

### Market the Work MAD LABS Actually Wants

The site should guide customers toward the intended service mix:

- Computer repair
- Tech support
- Home and small-business troubleshooting
- AI setup
- Websites
- Wi-Fi and devices
- Smart-home help
- Custom PCs
- Light automation

Do not overemphasize services the business does not want to market.

### Transparent Pricing, Not Spreadsheet Dumping

Use pricing to build trust.

Prefer:

- Starting prices
- Common services
- Consultation pricing
- Quote language for custom work
- Short policy notes

Avoid dumping the full internal price sheet onto public pages unless explicitly requested.

### Clear Calls to Action

Every major page should make the next step obvious:

- Contact MAD LABS
- Request a quote
- Book a consultation
- Ask about a service

CTA language should feel local, confident, and approachable.

---

## Accessibility Principles

### Accessibility Should Support the Design

Accessibility improvements should preserve the visual concept.

Do not interpret accessibility as a reason to remove the brand unless a specific effect cannot be made safe or usable.

### Semantic Structure

Use real:

- Headings
- Sections
- Navigation
- Buttons
- Links
- Labels
- Landmarks where appropriate

### Keyboard Usability

Interactive elements must be keyboard usable and have visible focus states.

This includes:

- CRT power button
- Navigation links
- Contact buttons
- Forms
- Any future interactive controls

### Decorative Layers Stay Decorative

CRT overlays, scanlines, glows, decorative SVGs, glitch layers, and purely visual effects should be hidden from assistive technology when appropriate.

Use `aria-hidden="true"` for decorative elements.

### Motion and Flicker Safety

Flicker and glitch effects must be controlled.

Avoid excessive flashing. Respect reduced-motion preferences.

---

## Audit Principles

### Investigate Before Editing

For audits, inspect before recommending.

For implementation, understand the existing structure before changing it.

### Separate Finding Types

Classify findings as:

#### Actual Issue

A current problem that is broken, slow, inaccessible, fragile, confusing, or likely to hurt users.

#### Polish Opportunity

A refinement that could make the site smoother, prettier, clearer, more responsive, or more professional.

#### Future Enhancement

A good idea that should not block the current phase.

### No Redesign-by-Audit

Do not create a giant issue list just because the site is visually ambitious.

Audit against the approved design intent, not against a generic template.

### Evidence-Backed Recommendations

Recommendations should point to:

- Specific files
- Specific selectors or components
- Specific behavior
- Specific user impact
- Specific performance or maintainability risk

Avoid vague claims like “this feels bad” without explaining why.

---

## Implementation Principles

### Smallest Safe Change

Fix the actual issue without rewriting stable parts.

### Preserve Working Behavior

Before changing animation or layout code, identify what currently works and protect it.

### TDOES Where It Fits

Use enough test/design/observation to prove the outcome.

For this site, that usually means:

- Build validation
- Type/import validation
- Browser inspection
- Responsive checks
- Animation behavior checks
- Reduced-motion checks
- Before/after visual comparison when practical

### PR-Ready Cleanliness

Do not leave:

- Broken imports
- Dead CSS
- Duplicate selector blocks
- Unused components
- Unexplained debug code
- Console noise
- Formatting drift
- Accidental markdown fences in source files
- Comments that describe old behavior

### No Git Mutation Without Permission

Do not stash, reset, restore, clean, normalize line endings, stage, commit, or otherwise mutate Git state unless explicitly instructed.

If the repo is dirty, report it and proceed only within the requested scope.

---

## Final Standard

The MAD LABS website should feel:

- Fast
- Smooth
- Polished
- Memorable
- Local
- Trustworthy
- Technically impressive
- Easy to understand
- Easy to contact
- Clearly not a generic template

The goal is not to make the site safer by making it boring.

The goal is to make the current CRT/neon/retro-tech direction feel professionally built, performance-conscious, responsive, and ready for real customers.
