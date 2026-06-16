# CrtHero.astro Decomposition Plan

> **Status:** Proposed  
> **Audience:** Igor + Josh  
> **Goal:** Break 2,826-line monolith into focused components without altering visual effect or behavior  
> **Guarantee:** Zero visual/behavioral regression — extract-only, no refactoring of animation timing, state machine, or event flow

---

## 1. Current Anatomy

| Section | Lines | % of File | 
|---------|-------|-----------|
| Frontmatter (imports) | 1–5 | <1% |
| HTML template | 6–242 | 8% |
| JS (single `<script>` block) | 245–944 | 25% |
| CSS (single `<style>` block) | 946–2826 | 67% |

**Already extracted** — 3 components that survive from an earlier pass:
- `CrtTaskbar.astro` (183 lines)
- `CrtTypingLabel.astro` (247 lines)
- `CrtDivider.astro` (253 lines)

**JS responsibilities (700 lines):**
1. State machine — timeline of hero phases (power-on → atom-reveal → title-seq → title-glow → divider-build → divider-open → restore → stable)
2. Power button — toggle on/off with "ARE YOU SURE?" confirm overlay
3. Audio system — load, play, mute, resume on interaction
4. Mouse-responsive glare — tracks mouse position on screen, sets CSS custom property
5. Skip-link handler — `madlabs:skip-intro` event → fast-forward to stable state
6. Scroll indicator — show/hide based on scroll position below hero

**CSS responsibilities (1,881 lines):**
Atmosphere layers, bezel, screen, glitch effects, power states, mute button, particles, atom orbits, corners, confirm overlay, scroll indicator, skip-link transition — all scoped within `.crt-hero` context.

---

## 2. Decomposition Strategy

**Golden rule:** Extract purely visual, non-interactive HTML+CSS first. Leave JS-coupled elements (power button, mute button, confirm overlay) in the parent unless a clean event-driven extraction is trivial.

### Why this works

1. **Astro's scoped CSS** handles component isolation automatically — selectors are rewritten with `data-*` attributes
2. **Parent state-to-child styling** works via `:global()` for `.is-stable .child-selector` patterns, OR by keeping only the parent-driven state selectors in the parent's CSS while the child owns its own structural CSS
3. **The JS state machine** touches `crtHero` (the `<section>`) class list exclusively — it never reaches into sub-element internals by JS, only by CSS cascade

### The `:global()` pattern for parent-driven child CSS

When the parent sets `.is-stable` and a child component needs `.is-stable .crt-something` style, the child's CSS uses:
```css
:global(.is-stable) .crt-something { /* ... */ }
```
This preserves the cascade without coupling the child to the parent's implementation.

---

## 3. Phase 1 — Pure Visual Extractions (Low Risk, Zero JS Coupling)

These are self-contained visual elements with NO behavior. Extract template + CSS together, verify build.

### Extract A: CrtAtmosphereLayers.astro

**What:** All CRT screen atmosphere overlay layers
**Template lines:** 14–79 (65 lines)  
**CSS sections:** `.crt-metal`, `.crt-boot-overlay` + children, `.crt-power-bloom`, `.crt-shutdown-overlay`, `.crt-shutdown-bloom`, `.crt-goodbye-message`, `.crt-glitch-chroma`, `.crt-glitch-static`, `.crt-glitch-tear`, `.crt-glitch-slices`, `.crt-glare`, `.crt-tint`, `.crt-bands`, `.crt-phosphor-dots`, `.crt-scanlines`, `.crt-vignette`, `.crt-bevel-inner` (~600 CSS lines)  
**CSS state selectors:** Many — `.is-powering-on`, `.is-shutting-down`, `.is-powered-off`, `.is-stable`, etc.  
**Strategy:** Move structural CSS (the base style) into child. Leave state-driven selectors (`.is-shutting-down .crt-shutdown-overlay`) in parent as `:global()` inside child component, OR keep them in parent.

**Better approach:** Keep ALL atmosphere CSS in the child component. The JS state machine sets classes on the `<section class="crt-hero">` parent. The child uses `:global(.is-stable) .crt-scanlines` patterns. This way the child is entirely self-sufficient.

**Props:** None — `aria-hidden="true"` throughout, purely decorative.

### Extract B: CrtParticles.astro

**What:** Floating ambient particles inside CRT screen  
**Template lines:** 81–115 (35 lines)  
**CSS sections:** `.crt-particles`, `.crt-particle` (~45 lines)  
**State selectors:** None — always shown  
**Props:** None — 8 `<span>` particles with hardcoded custom properties. Optionally accept particle config as prop for future flexibility.

### Extract C: CrtCornerBrackets.astro

**What:** 4 corner brackets  
**Template lines:** 117–120 (4 lines)  
**CSS sections:** `.crt-corner`, `.crt-corner--tl/tr/bl/br` (~50 lines)  
**State selectors:** Minimal — bracket visibility in stable state  
**Props:** None — truly trivial markup

### Extract D: CrtAtomLogo.astro

**What:** SVG atom with orbiting electrons  
**Template lines:** 122–192 (71 lines)  
**CSS sections:** `.crt-atom`, `.atom-orbits`, `.atom-orbit`, `.atom-orbit-highlight`, `.atom-nucleus-halo`, `.atom-nucleus-core`, orbit glow keyframes (`@keyframes orbitGlow*`) (~80 lines)  
**State selectors:** None — atom orbit animations are CSS-keyframe-based, driven by time, not state  
**Props:** None — purely decorative `aria-hidden="true"`

---

## 4. Phase 2 — JS-Coupled Extractions (Medium Risk, Event-Driven)

These have behavioral dependencies but can be cleanly extracted via custom events or callback props.

### Extract E: CrtConfirmOverlay.astro

**What:** "ARE YOU SURE?" confirmation overlay  
**Template lines:** 211–218 (8 lines)  
**CSS sections:** Lines 1303–1377 (~75 lines)  
**Current coupling:** Parent JS controls visibility via `showConfirmOverlay()`, `hideConfirmOverlay()`, and event listeners on `confirmYesBtn` and `confirmNoBtn`.  
**Extraction strategy:**
1. Child renders HTML + CSS + self-contained initialization JS
2. Child exposes custom events: `madlabs:confirm-yes`, `madlabs:confirm-no`
3. Child listens for `madlabs:show-confirm`, `madlabs:hide-confirm` events from parent
4. Parent's existing confirm logic calls `window.dispatchEvent(new CustomEvent('madlabs:show-confirm'))` instead of `showConfirmOverlay()`
5. Parent listens for `madlabs:confirm-yes` / `madlabs:confirm-no` and runs the existing shutdown logic

### Extract F: CrtScrollIndicator.astro

**What:** Scroll-down chevron below CRT bezel  
**Template lines:** 240–242 (3 lines, already outside `</section>`)  
**CSS sections:** Lines 2651–2693 (~43 lines)  
**Current coupling:** JS at lines 897–944 sets up scroll listener, shows/hides indicator when hero reaches stable state and viewport is below hero. Uses `document.querySelector('[data-scroll-indicator]')`.  
**Extraction strategy:**
1. Self-contained component with its own `<script>` block  
2. Uses `IntersectionObserver` or scroll listener, self-manages visibility
3. Listens for `madlabs:hero-stable` custom event from parent to start tracking
4. No props needed, no parent coupling beyond the event

---

## 5. What Stays in CrtHero.astro

After both phases, the parent retains:

**HTML:**
- Outer shell: `<section class="crt-hero">` → `<div class="hero-glow">` → `<div class="crt-bezel">` → `<div class="crt-screen">` → `<div class="crt-content">`
- Existing child component slots: `CrtTypingLabel`, `CrtDivider`, `CrtTaskbar`
- New child component slots: `CrtAtmosphereLayers`, `CrtParticles`, `CrtCornerBrackets`, `CrtAtomLogo`, `CrtConfirmOverlay`
- Power button + LED
- Mute button + LED

**JS (lines 245–944):**
- State machine (timeline, phase management)
- Power button click → confirm → shutdown → power on flow (modified to dispatch/respond to events for the extracted confirm overlay)
- Audio system (mute button → audio toggling stays coupled because it's tightly integrated)
- Mouse-responsive screen glare
- Skip-link handler
- (Scroll indicator JS removed — extracted into CrtScrollIndicator)

**CSS (estimated ~700 lines retained out of 1,881):**
- `.crt-hero` — outer container
- `.hero-glow` — glow effect
- `.crt-bezel` — bezel + rim + inner shadow
- `.crt-screen` — screen container
- `.crt-content` — content area
- `.crt-wordmark-slot`, `.crt-divider-slot`, `.crt-tagline` — content positioning
- `.crt-taskbar-area` — taskbar positioning
- `.crt-power-btn`, `.crt-power-led` — power button + LED
- `.crt-mute-btn`, `.crt-mute-led` — mute button + LED
- State cascade selectors for elements that stay in parent
- Skip-link transition CSS

---

## 6. Testing & Validation

### Before/After comparison protocol:

1. **Build both versions** — `pnpm build` on current (baseline) vs decomposed
2. **Compare dist output** — `diff -r dist-baseline/ dist-decomposed/` — should show zero differences in rendered HTML
3. **CSS scope comparison** — Astro's CSS scoping adds `data-astro-*` attributes. Decomposed version will have different attribute names. Run `pnpm build` and visually verify no regressions.
4. **JS behavior test** — Open in browser: cycle through power on → wait for intro → observe animations → power off → confirm dialog → power on again. All phases should fire identically.
5. **Accessibility check** — Tab through all interactive elements (power button, mute button, confirm dialog buttons). Focus states must work.

### Rollback plan:
- Each extraction is a single commit
- `git diff` before and after each extraction
- If any extraction breaks the build, revert that single commit
- CrtHero.astro.rollback already exists from a previous backup

---

## 7. Implementation Order

```
Phase 1a — CrtParticles.astro        (zero risk, 5 min)
Phase 1b — CrtCornerBrackets.astro   (zero risk, 5 min)
Phase 1c — CrtAtomLogo.astro         (zero risk, 10 min)
Phase 1d — CrtAtmosphereLayers.astro (low risk, 20 min — many CSS selectors)
─── Build & verify after Phase 1 ───
Phase 2a — CrtScrollIndicator.astro  (medium risk, 15 min — JS extraction)
Phase 2b — CrtConfirmOverlay.astro   (medium risk, 20 min — event wiring)
─── Full build & visual verification ───
```

---

## 8. Risk Register

| Risk | Mitigation |
|------|-----------|
| CSS cascade breaks across component boundary | Use `:global()` for parent-state-driven selectors in child CSS. Verify with build comparison. |
| JS selector `document.querySelector('[data-crt-screen]')` fails if screen is in a child | Screen container stays in parent. Only decorative sub-elements inside screen are extracted. |
| Custom event naming collision | Namespace all events: `madlabs:confirm-yes`, `madlabs:confirm-no`, `madlabs:show-confirm`, `madlabs:hide-confirm` |
| Astro scoped CSS breaks `@keyframes` animation name | Animation names are global in CSS — Astro doesn't scope them. Safe. |
| Build time regression | Extractions reduce CrtHero CSS from 1,881 lines → ~700 lines. Astro's CSS build time should decrease. |
| Visual regression from CSS cascade reordering | Each extraction is a single git commit. Baseline `dist/` is preserved for diff comparison. |

---

## 9. Estimated Impact

| Metric | Before | After (Phase 1) | After (Phase 2) |
|--------|--------|-----------------|-----------------|
| CrtHero.astro | 2,826 lines | ~1,760 lines | ~1,600 lines |
| Total new components | 0 | 4 | 6 |
| New component code | — | ~1,065 lines | ~1,226 lines |
| Behavior changes | — | Zero | Zero |
| Visual changes | — | Zero | Zero |
| Build verification | ✅ | ✅ after each phase | ✅ after each phase |

---

## 10. Approval Check

Before any code is written:
- [x] Full inventory of all template, JS, and CSS sections
- [x] Mapping of all CSS state selectors (`.is-*` variants)
- [x] Strategy for parent-driven child CSS (`:global()`)
- [x] Event-driven extraction pattern for JS-coupled components
- [x] Build comparison protocol for zero-regression guarantee
- [ ] **Josh approval** (awaiting)
