# Homepage Implementation Plan — Order of Operations

> Based on decisions recorded in `docs/AUDITS/Homepage-Audit-Response.md`
> and findings from `Homepage-Audit-2026-05-11.md` and `Homepage-Creative-Design-Audit-2026-05-11.md`
>
> Phases are ordered by dependency: later phases depend on earlier ones being complete.
> Each phase is reviewable, testable, and should pass `pnpm check && pnpm build` before proceeding.

---

## Phase 0: Foundation — Cleanup & Housekeeping

**No visual impact. No architecture changes. Pure cleanup.**

| Step | Task | Files Affected | Depends On |
|------|------|---------------|------------|
| 0.1 | Remove `crt-anim-motto` class from `index.astro` | `src/pages/index.astro` | — |
| 0.2 | Verify duplicate font isn't referenced, delete `src/assets/fonts/` | `src/assets/fonts/` (delete) | — |
| 0.3 | Delete `.crt-noise` selector from reduced-motion block in `global.css` | `src/styles/global.css` | — |
| 0.4 | Run `pnpm format` to fix Prettier on 4 files | All 4 files auto-formatted | — |
| 0.5 | Run `pnpm check && pnpm build` to verify clean state | — | 0.1-0.4 |

**Verification:** `pnpm ci` passes. No warnings, no errors.

---

## Phase 1: CSS Architecture — Bundle Reduction & Scoping

**Restructures CSS ownership so each page only loads what it needs.**
**Must be done before any visual changes to avoid rework.**

| Step | Task | Files Affected | Depends On |
|------|------|---------------|------------|
| 1.1 | Extract glitch system (~500 lines) from `global.css` into `CrtHero.astro` scoped `<style>` — glitch CSS is only used during hero intro events | `src/styles/global.css`, `src/components/CrtHero.astro` | Phase 0 |
| 1.2 | Move scroll-reveal CSS (`@supports (animation-timeline: view())` + all related keyframes) from `global.css` into `index.astro` scoped `<style>` — only homepage uses scroll-reveal | `src/styles/global.css`, `src/pages/index.astro` | 1.1 |
| 1.3 | Audit remaining `global.css` for any other page-specific blocks (e.g. CRT hero shared animation keyframes like `crt-taskbar-rise`, `crt-fade-up`, `crt-fade-in`) — move those into `CrtHero.astro` or a dedicated `src/styles/crt-animations.css` shared import | `src/styles/global.css`, `src/components/CrtHero.astro` | 1.2 |
| 1.4 | Add the `IntersectionObserver` scroll-reveal fallback as `<script is:inline>` in `index.astro` | `src/pages/index.astro` | 1.2 |
| 1.5 | Verify bundle sizes dropped — homepage ~35KB, other pages ~12-15KB | — | 1.1-1.4 |
| 1.6 | Run `pnpm check && pnpm build` | — | 1.5 |

**Verification:** `pnpm build` succeeds. `dist/` CSS assets smaller than before. Page rendering visually identical.

---

## Phase 2: Animation Architecture — Timeline Reliability

**Converts the intro timeline from JS setTimeout chains to CSS animation-delay.**
**Eliminates drift risk. Adds fail-safe. Reduces JS complexity.**

| Step | Task | Files Affected | Depends On |
|------|------|---------------|------------|
| 2.1 | Design CSS `animation-delay` schedule for ~10 intro phases (loading → power bloom → atom reveal → typing sequence → glow settle → divider build → divider open → glitch sequence → restore → final glow → stable) | Design doc (no code yet) | Phase 1 |
| 2.2 | Convert hero phase class toggles from JS `setTimeout` chain to CSS `animation-delay` keyed to a single master animation on `.crt-hero` | `src/components/CrtHero.astro` (JS + CSS) | 2.1 |
| 2.3 | Keep JS for glitch sub-timeline only (brief, non-cascading timing) — refactor to use `requestAnimationFrame` clock instead of cascading `setTimeout` | `src/components/CrtHero.astro` (JS) | 2.2 |
| 2.4 | Add single `setTimeout` fail-safe at `totalDuration + 3000ms` that forces stable state if timeline stalled | `src/components/CrtHero.astro` (JS) | 2.2 |
| 2.5 | Apply intro timing tightening (18s → ~14.8s) per timing table in Creative Audit §9.1 | `src/components/CrtHero.astro` | 2.2 |
| 2.6 | Offset band roll to 10.7s and CRT flicker to 7.6s to prevent sync pulsing | `src/components/CrtHero.astro` (CSS) | 2.2 |
| 2.7 | Run `pnpm check && pnpm build` and verify timeline plays correctly | — | 2.2-2.6 |

**Verification:** Intro plays at ~14.8s. No drift on simulated slow main thread (use Chrome DevTools CPU throttling). Fail-safe timer activates if CSS timeline is deliberately broken (test by removing a CSS class).

---

## Phase 3: Reduced Motion Consolidation

**Moves ALL `prefers-reduced-motion` CSS out of component scoped styles into a single non-scoped stylesheet. Eliminates every `!important` declaration.**

| Step | Task | Files Affected | Depends On |
|------|------|---------------|------------|
| 3.1 | Extract all `@media (prefers-reduced-motion: reduce)` blocks from: `CrtHero.astro`, `CrtTypingLabel.astro`, `CrtDivider.astro`, `CrtTaskbar.astro`, and `global.css` | All component files | Phase 2 |
| 3.2 | Consolidate into one `@media (prefers-reduced-motion: reduce)` block in `global.css` (or new `src/styles/reduced-motion.css` imported by `BaseLayout.astro`) | `src/styles/global.css` or new file | 3.1 |
| 3.3 | Remove all `!important` declarations — use `html.is-reduced-motion` scope + class selectors at sufficient specificity in non-scoped CSS | Consolidated reduced-motion file | 3.2 |
| 3.4 | Verify animation sequences are correctly disabled in reduced-motion mode for ALL elements | — | 3.3 |
| 3.5 | Verify no unintended visual regressions (elements should show in final state, not disappear) | — | 3.4 |
| 3.6 | Run `pnpm check && pnpm build` | — | 3.5 |

**Verification:** Zero `!important` declarations. All animations disabled in `prefers-reduced-motion: reduce`. All visible elements appear in their final state. No element is accidentally hidden.

---

## Phase 4: Visual Polish — CRT Hero Improvements

**Design quality improvements to the CRT bezel, screen, and atmosphere layers.**

| Step | Task | Files Affected | Depends On |
|------|------|---------------|------------|
| 4.1 | **Glow settle fix** — Replace `display: none` with `opacity: 0` on `.crt-glow-settle` so the animation is visible. Re-tune timing to match tightened wordmark sequence. | `src/components/CrtTypingLabel.astro` | Phase 2 |
| 4.2 | **Corner brackets restored** — Change stable state opacity from 0 to 0.2. Lower bottom brackets `bottom:` position to clear taskbar (currently 44px, need ~56px). Enable for reduced motion. | `src/components/CrtHero.astro` (CSS) | Phase 2 |
| 4.3 | **Bezel initial state brightness** — Adjust base `.crt-bezel` filter so initial paint shows proper beige, not darkened. Keep the concept (light from screen) but make it look good from frame 1. | `src/components/CrtHero.astro` (CSS) | Phase 2 |
| 4.4 | **Bezel plastic grain** — Add subtle `repeating-linear-gradient` or noise pattern at `opacity: 0.03-0.05` to `.crt-bezel::before` | `src/components/CrtHero.astro` (CSS) | 4.3 |
| 4.5 | **Diagonal CRT glare band** — Replace current static glare semi-ellipse with diagonal band using `clip-path: polygon(...)` or angled gradient. Keep subtle (opacity ~0.06). | `src/components/CrtHero.astro` (CSS) | Phase 2 |
| 4.6 | **Vignette z-index swap** — Change `.crt-vignette` from z-index 19 to 20, `.crt-scanlines` from z-index 20 to 19 | `src/components/CrtHero.astro` (CSS) | Phase 2 |
| 4.7 | **Bevel-inner-shadow radius** — Change bevel-inner-shadow border-radius from 34px to ~30px to match screen radius | `src/components/CrtHero.astro` (CSS) | Phase 2 |
| 4.8 | **Screen curvature** — Add `perspective: 1200px` to `.crt-screen` wrapper, very subtle `rotateX(0.5deg)`. Must be barely perceptible. | `src/components/CrtHero.astro` (CSS) | Phase 2 |
| 4.9 | **Tagline warm amber glow** — Change tagline `text-shadow` from purple to warm amber tones (#d4854a/#e89050) | `src/components/CrtHero.astro` (CSS) | Phase 2 |
| 4.10 | **`will-change` targeted additions** — Add 5 declarations (`.crt-screen`, `.crt-bands`, `.crt-metal`, `.crt-power-bloom`, `.crt-content`) | `src/components/CrtHero.astro` (CSS) | Phase 2 |
| 4.11 | **Intermediate viewport overflow** — Change `@media (max-width: 640px)` tagline wrap to `@media (max-width: 820px)` | `src/components/CrtHero.astro` (CSS) | Phase 2 |
| 4.12 | Run `pnpm check && pnpm build` | — | 4.1-4.11 |

**Verification:** All visual changes are subtle but measurable. No layout shifts. Corner brackets visible in stable state. Screen curvature barely noticeable — take a screenshot before/after and compare.

---

## Phase 5: Loading Atom Redesign

**Replaces the placeholder loading atom with a polished pixel version.**

| Step | Task | Files Affected | Depends On |
|------|------|---------------|------------|
| 5.1 | Design the pixel atom SVG — simplified atom symbol (3 orbits, nucleus) at lower resolution with pixel-perfect rendering | Design phase | — |
| 5.2 | Implement new pixel atom in the loading overlay — remove pill elements, replace with clean pixel orbit + spin animation | `src/components/CrtHero.astro` (SVG + CSS) | Phase 2 |
| 5.3 | Tune spin animation timing (pixel version should feel deliberate, not choppy — target `steps()` or smooth rotation depending on aesthetic) | `src/components/CrtHero.astro` (CSS) | 5.2 |
| 5.4 | Ensure transition from loading atom → power bloom → stable atom is smooth and matches tightened timeline | `src/components/CrtHero.astro` (CSS + JS) | 5.3 |
| 5.5 | Run `pnpm check && pnpm build` | — | 5.4 |

**Verification:** Loading animation is polished, not placeholder-quality. Transition to stable atom is smooth.

---

## Phase 6: Glitch Narrative & Power Button Enhancement

**Adds the "MAD LABS protocol" story to glitch sequences. Adds the "ARE YOU SURE?" power overlay.**

| Step | Task | Files Affected | Depends On |
|------|------|---------------|------------|
| 6.1 | Add protocol error message element to CrtHero HTML (hidden by default, shown during major glitch) — "SYSTEM GLITCH DETECTED: IMPLEMENTING MAD LABS PROTOCOL #42" styled as amber terminal text | `src/components/CrtHero.astro` (HTML + CSS) | Phase 2 |
| 6.2 | Add success confirmation message element — "MAD LABS PROTOCOL #42 — GLITCH CONTAINED. SYSTEM RESTORED." shown during restore phase, fades before sequence ends | `src/components/CrtHero.astro` (HTML + CSS) | Phase 2 |
| 6.3 | Wire protocol messages into the intro timeline (CSS animation-delay for show/hide timing) | `src/components/CrtHero.astro` (CSS) | 6.1-6.2 |
| 6.4 | Add "ARE YOU SURE?" overlay — full-screen dark overlay on CRT with Yes/No buttons. Triggered on power button click during non-stable states. Styled as CRT terminal prompt. | `src/components/CrtHero.astro` (HTML + CSS + JS) | Phase 2 |
| 6.5 | Wire Yes path → existing `shutDownMonitor()` sequence. Wire No path → victory glow effect (brief screen brighten + glow). | `src/components/CrtHero.astro` (JS) | 6.4 |
| 6.6 | Power button hover effect — add `:hover` brightness/glow change to telegraph interactivity | `src/components/CrtHero.astro` (CSS) | 6.4 |
| 6.7 | Run `pnpm check && pnpm build` | — | 6.1-6.6 |

**Verification:** Glitch sequence shows protocol messages at correct times. Power button during intro shows "ARE YOU SURE?" overlay. Yes shuts down. No gives victory glow.

---

## Phase 7: Audio System — Oscillator Sounds

**Adds typing sounds and CRT hum via Web Audio API oscillators + mute button.**

| Step | Task | Files Affected | Depends On |
|------|------|---------------|------------|
| 7.1 | Create shared audio module (`src/scripts/audio.ts` or inline in hero `<script>`) — manages a single `AudioContext`, provides `playTypingBlip()`, `startCrtHum()`, `stopCrtHum()`, `playVictorySound()` functions | New file or inline | — |
| 7.2 | Implement typing sound via oscillator — ~800Hz square wave, 50ms duration, gain envelope for click feel. Schedule one per letter during the march animation. | Audio module | 7.1 |
| 7.3 | Implement CRT hum — 60Hz + 120Hz sine waves mixed at very low gain (~0.02-0.03), fades in with boot, fades out at stable state | Audio module | 7.1 |
| 7.4 | Implement victory sound — brief ascending tone or chord for the "No" path on power button | Audio module | 7.1 |
| 7.5 | Wire typing sounds into the intro timeline — each letter step triggers `playTypingBlip()` at the correct offset | `src/components/CrtHero.astro` (JS) | 7.2, Phase 2 |
| 7.6 | Wire CRT hum into boot/stable lifecycle — hum starts at `is-powering-on`, fades out by `is-stable` | `src/components/CrtHero.astro` (JS) | 7.3, Phase 2 |
| 7.7 | Add mute button to monitor housing — styled as a physical push-button (similar to power button), positioned on the bezel. Toggle between muted/unmuted states. Persist preference in `localStorage`. | `src/components/CrtHero.astro` (HTML + CSS + JS) | 7.1 |
| 7.8 | Add volume control (optional — three-position rocker or small slider, integrated into monitor casing design) | `src/components/CrtHero.astro` (HTML + CSS + JS) | 7.7 |
| 7.9 | Handle autoplay policy — `AudioContext` created on page load (suspended). Resume on first user interaction. Sound plays silently until resumed — no error state for the user. | Audio module + Hero JS | 7.1 |
| 7.10 | Run `pnpm check && pnpm build` | — | 7.1-7.9 |

**Verification:** Typing sounds play on letter march. CRT hum plays during boot, fades at stable. Mute button toggles all sounds. Victory sound plays on "No" path. Works in Chrome, Firefox, Safari.

---

## Phase 8: Interactive Additions

**Mouse-responsive glare, orbit electrons, ambient particles, link hover ripple, LED effects.**

| Step | Task | Files Affected | Depends On |
|------|------|---------------|------------|
| 8.1 | **Mouse-responsive screen glare** — Track mouse position relative to CRT screen. Shift glare layer by small offset (max 15px). Use `requestAnimationFrame` throttling. | `src/components/CrtHero.astro` (JS + CSS) | Phase 2 |
| 8.2 | **Orbit electrons** — Add 3px glowing circles to each atom orbit path using CSS Motion Path (`offset-path`) or JS-positioned elements | `src/components/CrtHero.astro` (SVG + CSS/JS) | Phase 2 |
| 8.3 | **Subtle ambient particles** — Absolutely-positioned floating dots (<2px, near-invisible) inside CRT screen with slow CSS drift animation | `src/components/CrtHero.astro` (HTML + CSS) | Phase 2 |
| 8.4 | **Link hover ripple** — On taskbar link hover, show a brief amber expanding ring animation (pseudo-element with `transform: scale()` triggered on hover) | `src/components/CrtTaskbar.astro` (CSS) | Phase 3 |
| 8.5 | **Power LED pulsing during boot** — Add `animation: crtLedPulse` to `.crt-power-led` during `is-powering-on` through `is-final-glow` states | `src/components/CrtHero.astro` (CSS) | Phase 2 |
| 8.6 | **Power supply idle glow (off state)** — Add very slow `@keyframes` pulse (25-30s) to `.crt-screen` when `.is-powered-off` — `#080810` to `#020203` | `src/components/CrtHero.astro` (CSS) | Phase 2 |
| 8.7 | Run `pnpm check && pnpm build` | — | 8.1-8.6 |

**Verification:** Glare follows mouse. Orbit electrons visible on atom paths. Particles drift inside screen. Taskbar links have hover ripple. LED pulses during boot, steady after. Off-state faintly glows.

---

## Phase 9: Navigation — Skip Link, Scroll Indicator, Back-to-Top

**Accessibility and navigation enhancements.**

| Step | Task | Files Affected | Depends On |
|------|------|---------------|------------|
| 9.1 | **Momentum skip-link** — Implement skip-to-content link at top of page. When activated, compress remaining intro into 0.8-1s accelerated blur transition. Add HTML element to `BaseLayout.astro`. Wire JS to trigger compressed timeline. | `src/layouts/BaseLayout.astro`, `src/components/CrtHero.astro` (JS) | Phase 2 |
| 9.2 | **Scroll-down indicator** — Add animated amber chevron/pulsing dot below CRT bezel. Positioned at bottom of `.crt-hero` section. CSS animation loop (2-3s). Fades out after 200px scroll via IntersectionObserver. | `src/components/CrtHero.astro` or new component (HTML + CSS + JS) | Phase 3 |
| 9.3 | **Back-to-top button** — CRT-themed return-to-top button. Hidden by default. Appears after scrolling past hero + first content section. Click smoothly scrolls to top. Styled as a small amber circle/chevron with power-on hover glow. | New component or inline (HTML + CSS + JS) | Phase 3 |
| 9.4 | Run `pnpm check && pnpm build` | — | 9.1-9.3 |

**Verification:** Skip link appears on Tab. Activating it shows compressed blur transition to stable state, then focuses main content. Scroll indicator visible below CRT. Back-to-top appears after scrolling, scrolls to top on click.

---

## Phase 10: Color & Styling — Global Polish

**Color adjustments, section backgrounds, screen brightness, footer glow.**

| Step | Task | Files Affected | Depends On |
|------|------|---------------|------------|
| 10.1 | **Screen brightness** — Adjust `.crt-screen` background from `#281845` to a brighter purple (test `#332356` or `#362866`). Update `.crt-metal` gradient accordingly. | `src/components/CrtHero.astro` (CSS) | Phase 4 |
| 10.2 | **Amber `#e89050` update** — Change `--lab-accent` and related color variables. Add `text-shadow` glow to amber text elements where needed. Review all amber usages. | `src/styles/global.css`, component files | Phase 1 |
| 10.3 | **Lighten section backgrounds below hero** — Adjust `--lab-surface` (#120824 → lighter) and `--lab-surface-alt` (#1e1040 → lighter). Add radial-gradient overlay transitions. | `src/styles/global.css` | Phase 1 |
| 10.4 | **Ambient screen glow spill** — Add gradient transition between hero section background and first content section. Purple/amber spill that suggests CRT illuminates the space below. | `src/styles/global.css` | 10.3 |
| 10.5 | **Footer CRT glow echo** — Add very subtle amber or purple tint gradient to footer background at low opacity. | `src/styles/global.css` | Phase 1 |
| 10.6 | Run `pnpm check && pnpm build` — verify no contrast regressions | — | 10.1-10.5 |

**Verification:** Screen is visibly brighter but still purple. Amber elements slightly lighter (`#e89050`). Section backgrounds brighter with gradient transitions. Footer has subtle CRT echo.

---

## Phase 11: Font Self-Hosting

**Removes Google Fonts dependency by serving WOFF2 files locally.**

| Step | Task | Files Affected | Depends On |
|------|------|---------------|------------|
| 11.1 | Download Monofett, Jersey 25, and VT323 as WOFF2 format | Downloads (external) | — |
| 11.2 | Place WOFF2 files in `public/fonts/` | `public/fonts/` | 11.1 |
| 11.3 | Add `@font-face` declarations in `global.css` with `font-display: swap` | `src/styles/global.css` | Phase 1 |
| 11.4 | Remove `@import url("...fonts.googleapis.com...")` from `global.css` | `src/styles/global.css` | 11.3 |
| 11.5 | Add `<link rel="preconnect">` hints to `BaseLayout.astro` (interim optimization before self-hosting is live) | `src/layouts/BaseLayout.astro` | — |
| 11.6 | Verify fonts render correctly in all three weights/variants | — | 11.3-11.4 |
| 11.7 | Run `pnpm check && pnpm build` | — | 11.6 |

**Verification:** All text renders with correct fonts. No external font requests in network tab. Fallbacks work if fonts fail to load.

---

## Phase 12: Content Components (Gated)

**Build the review shower and social media components, but render nothing until content exists.**

| Step | Task | Files Affected | Depends On |
|------|------|---------------|------------|
| 12.1 | Build `ReviewShower.astro` component — auto-scrolling review cards with amber styling. Gated: renders nothing if `reviews` array is empty. | `src/components/ReviewShower.astro` (new) | Phase 10 |
| 12.2 | Build `SocialLinks.astro` component — social media icon links. Gated: renders nothing if `socialLinks` map is empty. | `src/components/SocialLinks.astro` (new) | Phase 10 |
| 12.3 | Integrate into homepage CTA section — two-column layout (reviews left, CTA right + social below button) | `src/pages/index.astro` | 12.1-12.2 |
| 12.4 | Integrate same components into Contact page | `src/pages/contact.astro` | 12.1-12.2 |
| 12.5 | Verify nothing renders on screen (no empty containers, no placeholder text) | — | 12.3-12.4 |
| 12.6 | Run `pnpm check && pnpm build` | — | 12.5 |

**Verification:** `ReviewShower` and `SocialLinks` produce zero HTML output when their data arrays are empty. Contact page unchanged visually. Homepage layout unaffected.

---

## Phase 13: Final Validation

**Comprehensive validation before merge.**

| Step | Task | Depends On |
|------|------|------------|
| 13.1 | `pnpm format` — ensure all files formatted | All phases |
| 13.2 | `pnpm lint` — zero warnings | All phases |
| 13.3 | `pnpm check` — zero Astro type errors | All phases |
| 13.4 | `pnpm build` — production build succeeds | All phases |
| 13.5 | Dev server smoke test — homepage renders, intro plays, all interactive elements work | All phases |
| 13.6 | Visual review — full-page screenshot, compare against pre-change baseline | All phases |
| 13.7 | Reduced-motion test — all animations disabled, all elements visible | Phase 3 |
| 13.8 | Mobile viewport test — 375px, 768px, 1024px widths | Phases 4, 10 |
| 13.9 | Git commit — meaningful commit message with reference to audit documents | All phases |

---

## Summary: Effort & Risk per Phase

| Phase | Items | Est. Edits | Risk Level | Notes |
|-------|-------|-----------|------------|-------|
| 0 — Cleanup | 5 | 4 files | None | Safe deletions + prettier |
| 1 — CSS Arch | 6 | 3-4 files | Low | Scoped extraction, no logic changes |
| 2 — Timeline | 7 | 1 file | **Medium** | Core animation rework; test thoroughly |
| 3 — Reduced Motion | 6 | 5 files | Low | Consolidation only |
| 4 — Visual Polish | 12 | 1-2 files | Low | Subtle visual tweaks |
| 5 — Loading Atom | 4 | 1 file | Low | Isolated to loading state |
| 6 — Glitch/Power | 7 | 1 file | Low | New overlay elements |
| 7 — Audio | 10 | 1-2 files | Low | No visual impact |
| 8 — Interactive | 7 | 2-3 files | Low | New animations, no structural change |
| 9 — Navigation | 4 | 2-3 files | Low | New elements, well-isolated |
| 10 — Color/Styling | 6 | 2 files | Low | CSS variable changes |
| 11 — Fonts | 7 | 2 files | Low | File copy + CSS declarations |
| 12 — Content | 6 | 4 files (new) | None | Gated components |
| 13 — Validation | 9 | — | — | Testing only |

**Total estimated files modified:** ~20 unique files (many edits touch the same files across phases)
**Highest risk phase:** Phase 2 (animation timeline architecture) — test on real devices with CPU throttling before proceeding to Phase 3+.

---

*Plan generated: 2026-05-11*
*Based on: Homepage-Audit-2026-05-11.md, Homepage-Creative-Design-Audit-2026-05-11.md, Homepage-Audit-Response.md*
