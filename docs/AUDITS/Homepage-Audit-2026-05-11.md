# Homepage Forensic Audit — 2026-05-11

## 1. Executive Summary

**Verdict: Structurally healthy but has significant polishing debt.**

The homepage builds, checks, and renders without errors. The CRT hero is a strong visual centerpiece with thoughtful animation sequencing. However, four key problem areas emerge:

1. **CSS bloat** — The homepage loads 72KB of CSS (49KB index + 23KB about page CSS), partly due to a shared global CSS that includes code for all pages. 52 `@keyframes` definitions across the codebase, most in CrtHero.astro alone.
2. **Asset & CSS hygiene issues** — Duplicated font file, dead CSS selectors, orphaned CSS classes, and unused components referenced in global CSS.
3. **Animation risk** — Heavy use of `steps()` timing, 17 concurrent running animations at stable state, and browser compositing concerns with `mix-blend-mode` and `filter` on animated elements.
4. **Aspect ratio mismatch** — The CRT screen uses `16 / 9` (modern widescreen) vs. the specified `3 / 2` (classic CRT monitor).

**The homepage is safe to build upon, but should clean up these issues before the Services page goes into heavy production work.**

---

## 2. Files Inspected

| File | Why It Matters |
|------|----------------|
| `src/pages/index.astro` | The main homepage template — imports, layout, content sections, scoped styles |
| `src/layouts/BaseLayout.astro` | Shared document shell — DOCTYPE, meta, favicon, footer, `<slot>` for content |
| `src/components/CrtHero.astro` | The CRT monitor hero — all visual layers, animation sequencing script, ~1700 lines of CSS |
| `src/components/CrtTaskbar.astro` | Taskbar nav — the primary page navigation |
| `src/components/CrtTypingLabel.astro` | "MAD LABS" wordmark — typing animation, glow settle, Monofett font |
| `src/components/CrtDivider.astro` | Divider line segment — `< / >` mark with expand animation |
| `src/styles/global.css` | Global styles — design tokens, Tailwind v4 import, shared animations, glitch system, scroll-reveal, reduced motion |
| `src/assets/fonts/` | Orphaned font directory (duplicate copy) |
| `public/fonts/` | Actual fonts served by the site |
| `astro.config.mjs` | Astro + Vite config — polling watch enabled |
| `package.json` | Scripts and dependencies |

Additional checks: built output (`dist/`), HTTP response headers, bundle sizes, source-level pattern searches.

---

## 3. Commands / Checks Run

| Command | Result | Notes |
|---------|--------|-------|
| `pnpm check` | PASS — 0 errors, 0 warnings, 0 hints | Astro type checking clean |
| `pnpm lint` | PASS — exit 0 | ESLint found no issues |
| `pnpm format:check` | **FAIL** — 4 files unformatted | `CrtTaskbar.astro`, `CrtTypingLabel.astro`, `index.astro`, `global.css` |
| `pnpm build` | PASS — 4 pages built in 3.35s | Static build succeeds |
| `curl http://localhost:4322/` | HTTP 200 | Built page served correctly |
| Built CSS size audit | index: 49KB, about: 23KB | Homepage loads both (72KB total CSS) |
| Built HTML size | 15.6KB | Reasonable for the content |
| Favicon check | HTTP 200, 242 bytes | Small SVG favicon exists |
| Git state check | **DIRTY** — 4 modified + 15 untracked files | Working tree has uncommitted changes |

### Files failing Prettier formatting:
- `src/components/CrtTaskbar.astro`
- `src/components/CrtTypingLabel.astro`
- `src/pages/index.astro`
- `src/styles/global.css`

No auto-fixes were applied per audit rules.

---

## 4. Homepage Rendering & Layout Findings

### 4.1 HTML Structure
- ✅ Semantic `<html lang="en">` present
- ✅ Viewport meta tag present: `width=device-width, initial-scale=1`
- ✅ Meta description present: "MAD LABS computer repair and mobile IT solutions."
- ✅ `<main id="main-content">` wraps all content
- ✅ Heading hierarchy: `<h1>` (MAD LABS) followed by `<h2>` elements for sections
- ✅ Footer present with copyright and dynamic year

### 4.2 Layout Sections (top to bottom)
1. **CRT Hero** — Full-viewport-height hero section with CRT monitor visual
2. **Hero sub-tagline** — `.hero-sub` section with "Everyone deserves..." paragraph
3. **Capabilities** — `.what-we-do` section with services description
4. **Trust** — `.trust` section with pricing philosophy
5. **CTA** — `.cta` section with "Contact MAD LABS" button
6. **Footer** — Copyright line

### 4.3 Orphaned/Dead CSS Classes
- **`.crt-anim-motto`** — Applied to the `.hero-sub` section in `index.astro` line 9, but this class is **never defined** in any CSS file. It is a dead class name with no styling effect.
- **`.skip-link`** — Fully defined in `global.css` with positioning, focus states, transitions, and `z-index: 9999`, but the skip-link element is **never rendered** in `BaseLayout.astro` or any homepage page. The user gets no skip-to-content navigation.
- **`.crt-noise`** — Referenced in `global.css` line 1085 under `prefers-reduced-motion` (`display: none !important`), but this class does not exist in the homepage HTML. Dead selector.

### 4.4 Scroll-Reveal Animations
- Uses experimental `@supports (animation-timeline: view())` CSS feature (global.css lines 1039-1046)
- **Risk:** This is a relatively new CSS feature (Chrome 115+, Firefox 127+). Safari support arrived in Safari 18.2 (late 2024). Users on Safari < 18.2 or older browsers will get no scroll-reveal animation — the sections will simply appear. This is a graceful degradation, but worth noting.

### 4.5 No Back-to-Top or Navigation Hints
- The homepage has no "scroll down" indicator after the CRT hero. Users at the top of the page see the CRT boot sequence and then have no visual cue to scroll further. This can cause confusion — is there more content?

---

## 5. CRT Hero / Animation Findings

### 5.1 Aspect Ratio Mismatch (⚠️ CONCERN)
- **Code uses:** `aspect-ratio: 16 / 9` (CrtHero.astro line 576)
- **Design spec requires:** `aspect-ratio: 3 / 2` (per `crt-hero-implementation` skill)
- **Impact:** 16:9 is a modern widescreen TV/monitor ratio, while 3:2 is closer to a classic CRT monitor from the era being referenced. This makes the CRT hero screen wider and shorter than intended by the design. This should be corrected — 16:9 makes the CRT look more like a modern flatscreen than a retro CRT.

### 5.2 Animation Weight — 52 Total `@keyframes`

| File | Keyframe Count |
|------|---------------|
| `CrtHero.astro` | 33 |
| `global.css` (shared) | 19 |
| `CrtTypingLabel.astro` | 4 |
| `CrtDivider.astro` | 1 |
| **Total** | **52** |

This is an extraordinary number of keyframe definitions for a single page. While each is individually well-crafted, the cumulative rendering cost is a concern — particularly on lower-end mobile devices.

### 5.3 Concurrent Runtime Animations at "Stable" State
When the CRT reaches `.is-stable` state, the following animations run concurrently:
- `crtHeroFlicker` (8s infinite) — opacity modulation on the screen
- `crtHeroNeonFlicker` (6s infinite) — opacity on the atom
- `atomWireframeSpin` (18s linear infinite) — SVG rotation
- `atomOrbitGlowFlow` (5.2s linear infinite) — stroke-dashoffset on 3 orbits
- `atomGlowPulse` (1.9s infinite) — opacity/width on 3 orbits
- `atomNucleusShimmer` (2.8s infinite) — scale/filter
- `atomCoreShimmer` (2.8s infinite) — scale
- `crtHeroRoll` (10s linear infinite) — background-position on bands
- Scanlines (static repeating gradient, no animation)
- Phosphor dots (static radial gradient, no animation)

That's **7-8 concurrent animated properties** at stable state. On battery-powered or low-end devices, both `filter` + `mix-blend-mode` on stacked layers can cause painting/compositing overhead.

### 5.4 Glitch Sequence Timing
The intro timeline spans **18.04 seconds** with 17 scheduled callbacks:
```
0ms     → is-loading
450ms   → is-powering-on
3600ms  → is-atom-revealing
4700ms  → is-title-sequencing
7420ms  → is-title-glowing
8600ms  → is-divider-building
9480ms  → is-divider-opening
11100ms → flicker pop (minor)
11320ms → glitch minor
14040ms → major glitch (twin burst)
15400ms → is-restoring
16900ms → final glow
18040ms → is-stable
```

**Risk:** On slow devices or under CPU contention, `setTimeout` callbacks can drift. A laggy browser tab at 11s could shift the entire sequence, causing elements to appear/disappear at wrong times. The sequence uses JavaScript-driven class toggling, not CSS animations with `animation-delay`, so it's dependent on main thread availability.

### 5.5 `steps()` Timing for Loading Atom
- `crtLoadingAtomIdle` — `steps(3, end) infinite`
- `crtLoadingNucleusPulse` — `steps(3, end) infinite`
- `crtLoadingCorePulse` — `steps(3, end) infinite`

The 3-step idle animations may look choppy on high-refresh-rate displays (120Hz+). Consider increasing steps or using a smoother timing function.

### 5.6 Loading Atom Pill Colors
The loading atom pre-boot uses orange/pink/green pills. The stable-state atom uses orange/pink/green orbit highlights. This is consistent — but the CRT skill spec says the atom should have "purple orbits with white glow (NOT green)." The green is present on both loading and stable atoms. If the client spec requires purple-only, this is a color deviation.

### 5.7 `will-change` Declaration Count
Only 6 `will-change` declarations across the codebase (CrtHero: 1, CrtTypingLabel: 3, CrtDivider: 1, CrtTaskbar: 1). This is conservative and good practice. However, elements with filter and animation on 52 keyframes without `will-change` may cause repaints.

---

## 6. Performance & Loading Findings

### 6.1 CSS Bundle Size (⚠️ CONCERN)
- Homepage loads **72KB of CSS** (index.BhshyGov.css: 49KB + about.ZzOrnIck.css: 23KB)
- The about page CSS is loaded because Astro groups all global CSS into a shared chunk
- **Only ~10-15KB is unique to the homepage** — the rest is global tokens, shared layouts, and about page styles that aren't needed on the homepage

**Recommendation:** Audit the global CSS and split page-specific code into scoped `<style>` blocks. Tailwind v4's output is already minimal, but the glitch system CSS in `global.css` accounts for a significant portion of the weight.

### 6.2 Google Fonts Loading
- `global.css` line 3: `@import url("...fonts.googleapis.com/css2?family=Jersey+25&family=Monofett&family=VT323&display=swap")`
- Three Google Fonts loaded in a single request ✅
- `font-display: swap` present on the local font ✅
- The Google Fonts `@import` is NOT preloaded — it's discovered only when the CSS is parsed. This means the font request doesn't start until the CSS file finishes downloading and parsing.
- **Risk:** `Monofett` is used for the wordmark that appears at ~4.7s into the intro sequence. If the font hasn't loaded by then, the browser may show a fallback font briefly (FOUT).

### 6.3 Duplicated Font File (⚠️ WASTE)
- `/mnt/d/Workspaces/mad-labs-website/public/fonts/Early GameBoy.ttf` — **10,616 bytes**
- `/mnt/d/Workspaces/mad-labs-website/src/assets/fonts/Early GameBoy.ttf` — **10,616 bytes (identical)**

The font exists in both `public/fonts/` (where it's actually served from) and `src/assets/fonts/` (where it's not referenced by anything). The `src/assets/fonts/` copy is dead weight in the repo.

### 6.4 No JavaScript Frameworks
- ✅ No React, Vue, Svelte — pure Astro + vanilla JS
- ✅ Client-side JS is ~4KB minified (boot sequence + divider script)
- ✅ No external JS dependencies for animations

### 6.5 No Image Assets on Homepage
- The homepage has zero `<img>` tags — all visuals are CSS/SVG
- ✅ No image loading overhead
- ✅ No cumulative layout shift from images
- **Concern:** The CRT glow, scanlines, and phosphor dots are all CSS gradients/radials. These are GPU-composited but have complex layering that can stress mobile GPUs.

### 6.6 Astro Dev Server Polling
- `astro.config.mjs` enables `usePolling: true` with `interval: 250`
- This is necessary for WSL file watching but increases CPU usage during development
- No impact on production performance

---

## 7. Browser / Astro / Dev-Server Quirks

### 7.1 Stale Dev Server Reload
- `usePolling: true` with `interval: 250` can cause slow HMR on large file saves. The 250ms polling interval plus Astro's own rebuild time can make saves feel sluggish.
- **Recommendation:** If this becomes annoying, consider `chokidar` with WSL-specific polling workarounds rather than the generic Vite polling.

### 7.2 Scroll-Reveal Incompatibility
- `@supports (animation-timeline: view())` is supported in Chrome 115+, Firefox 127+, Safari 18.2+.
- **Not supported in:** Firefox < 127, Safari < 18.2, any version of Chrome < 115.
- Falls back gracefully (no animation, content visible from start).

### 7.3 `mix-blend-mode: screen` on Glitch Layers
- The `.crt-glitch-chroma`, `.crt-glitch-static`, `.crt-glitch-tear`, and `.crt-glitch-slices` all use `mix-blend-mode: screen`.
- On browsers that don't support `mix-blend-mode` (very old browsers/Opera Mini), these layers may appear as solid white/colored rectangles covering the screen.
- The glitch layers are `position: absolute; inset: 0; z-index: 35` — if blend mode fails, they're opaque overlays.

### 7.4 `data-astro-cid-*` Attributes in Production
- The built HTML contains `data-astro-cid-*` attributes on every element (6 per page view). These are Astro's scoped-style identifiers. They add ~600 bytes to the HTML but are necessary for style scoping.

### 7.5 Tagline Contains Escaped HTML Entity
- `<p class="crt-tagline">Computer Repair, Tech Support, &amp; AI Solutions</p>`
- The `&amp;` is correctly rendered as `&` in the browser ✅
- In the source `.astro` file, this is written as `&amp;` (line 183 of CrtHero.astro). This is correct for Astro templates, but worth noting that newer Astro versions may handle this differently.

### 7.6 `crt-anim-motto` Class Has No Effect
- The `crt-anim-motto` class on the `.hero-sub` section (index.astro line 9) matches no CSS rule anywhere. It's a vestigial class name.
- It's listed in the CSS class list as if it triggers some animation, but it has zero CSS effect.

---

## 8. Professionalism / UX / Trust Findings

### 8.1 Strong Points
- ✅ Professional copy — clear, confident, and appealing to local Cincinnati audience
- ✅ Contact CTA button prominently placed at bottom of homepage
- ✅ "Upfront Pricing. No Upsells." builds trust
- ✅ Good proposition: "Modern tools. Old-school reliability. Zero tech tantrums."

### 8.2 No "Scroll Down" Indicator
- The CRT hero fills 100svh. After the 18-second boot animation, users see a beautiful CRT monitor but no indicator to scroll down.
- **Recommendation:** Add a subtle animated scroll-down indicator (chevron, arrow, or pulsing dot) near the bottom of the CRT bezel or below it. Without it, first-time visitors may think the CRT is the entire page.

### 8.3 No Skip-to-Content Link
- `.skip-link` CSS is fully defined in `global.css` but the HTML element is missing from `BaseLayout.astro`.
- Keyboard users, screen reader users, and power users who tab on page load get no way to bypass the 18-second animation sequence.
- This is an accessibility AND UX issue — even sighted keyboard users must wait through the full boot sequence before reaching content.

### 8.4 Active Power Button During Boot Sequence
- The power button has `aria-pressed="true"` immediately and clicking it triggers `shutDownMonitor()` even during the intro sequence.
- ✅ The shutdown has a guard (`is-shutting-down` check prevents double-trigger).
- **Risk:** If a user clicks the power button during the intro sequence (~3-8s in), the shutdown animation plays, and they see "GOODBYE, HUMAN." This is a jarring experience for a first-time visitor.

### 8.5 Tagline Text Mismatch
- **CRT skill spec says:** "Computer Repair & Mobile IT Solutions"
- **Actual code says:** "Computer Repair, Tech Support, & AI Solutions"
- This is a deliberate content choice, not a bug. The code version is arguably better (more specific), but differs from the formal spec.

### 8.6 Contact Link Goes to a Separate Page
- The CTA button links to `/contact/` which is a separate page (static, presumably with a contact form or info).
- This is standard practice and professionally appropriate.

### 8.7 No Social Proof / Reviews
- No testimonials, review stars, or customer logos on the homepage.
- This reduces trust-building potential, especially for a computer repair business where social proof is important.
- **Note:** This is a "Polish Phase" recommendation — not blocking.

---

## 9. Accessibility Findings

### 9.1 Missing Skip-to-Content
- As noted above, no skip link rendered in `BaseLayout.astro` despite `.skip-link` CSS being fully defined.
- **Violation of WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks).** Every page must have a way to skip repeated content.
- Combined with the 18-second animation sequence, this is a significant accessibility blocker.

### 9.2 CRT Hero is `<h1>` ✅
- The "MAD LABS" wordmark in CrtTypingLabel.astro is an `<h1>` with `aria-label="MAD LABS"`.
- The visual typing animation is on an `aria-hidden="true"` child span.
- This is correct and well-implemented.

### 9.3 Taskbar Navigation ✅
- Semantic `<nav aria-label="Primary">` with `<ul>` > `<li>` > `<a>` structure.
- Links have `href` attributes pointing to real routes.
- `min-height: 44px` on links meets tap target recommendations.
- `focus-visible` styles are defined.

### 9.4 `prefers-reduced-motion` Handling — INCOMPLETE
- ✅ Animation cancels are present in CrtHero.astro, CrtTypingLabel.astro, CrtDivider.astro, CrtTaskbar.astro, and global.css
- ✅ The JavaScript checks `prefersReducedMotion` and calls `showStablePoweredOnState()` immediately
- ✅ `animation: none !important` and `transform: none !important` applied
- ⚠️ **CrtHero.astro `prefers-reduced-motion` block is missing some elements:**
  - `.crt-power-bloom` is cancelled (line 2066)
  - But `.crt-loading-icon` (the loading atom) is cancelled (line 2067)
  - `.crt-boot-overlay` is `display: none` (line 2085-2087) ✅
  - `.crt-shutdown-overlay` is NOT in the reduced-motion block — but this is probably fine since reduced-motion users go directly to stable state
- ⚠️ **Some animations still have `!important` overrides in reduced motion** — heavy-handed, but effective

### 9.5 Contrast
- Text on dark backgrounds:
  - `#f0eaff` on `#332356` (CRT text on screen) — ~8.5:1 contrast ratio ✅
  - `#b0a8c8` on `#120824` (body text on surface) — ~6.2:1 ratio ✅
- Amber accents `#d4854a` on dark backgrounds — ~3.5:1 ratio ⚠️ (passes for large text, fails for body text)
- "Why Choose Us" heading uses `#e0d0ff` on `#120824` — great contrast ✅

### 9.6 Aria Usage
- ✅ `aria-label` on hero section, taskbar nav, sections
- ✅ `aria-hidden="true"` on decorative elements
- ✅ `aria-labelledby` on sections pointing to heading IDs
- ✅ `aria-pressed` on power button
- ✅ Role attributes on navigation

### 9.7 Keyboard Navigation
- ✅ Taskbar links are keyboard-focusable `<a>` elements
- ✅ Power button is a `<button>` with `cursor: pointer`
- ✅ `focus-visible` styles on taskbar links, power button, lab links, lab button
- ⚠️ No visible focus indicator on `.lab-section` sections themselves (they're not interactive, so this is acceptable)
- ⚠️ No "skip intro" or "skip animation" button for keyboard users stuck through the 18s boot sequence

### 9.8 Tagline `white-space: nowrap` on Mobile
- `.crt-tagline` uses `white-space: nowrap` (CrtHero.astro line 1366)
- On mobile (640px breakpoint), the tagline has `white-space: normal` (line 2004) ✅
- But the base style at desktop could cause overflow on intermediate viewport sizes between 640px and ~768px where the text may be too long for the CRT screen width

---

## 10. Prioritized Recommendations

### 🔴 Must Fix Before Services Page

| # | Issue | Why |
|---|-------|-----|
| 1 | **Missing skip-to-content link in BaseLayout.astro** | WCAG violation + 18s animation blocker. Render the `.skip-link` element. |
| 2 | **CRT screen `aspect-ratio: 16/9` vs design spec `3/2`** | Visual identity mismatch. The CRT looks like a modern flatscreen, not a retro monitor. |
| 3 | **Dead `crt-anim-motto` class on hero-sub section** | Orphan CSS class with no effect. Remove it. |
| 4 | **Prettier formatting on 4 files** | CI pipeline (`pnpm ci`) will fail. Run `pnpm format` to fix formatting. |

### 🟡 Should Fix Soon

| # | Issue | Why |
|---|-------|------|
| 5 | **Duplicate font in `src/assets/fonts/`** | Waste — remove `src/assets/fonts/`; the actual font is in `public/fonts/` |
| 6 | **Dead `.crt-noise` selector in global.css** | Referenced in reduced-motion but doesn't exist in HTML — remove or add the HTML element |
| 7 | **Dead `.skip-link` CSS (selector exists, element doesn't)** | Either render the skip link or remove the CSS |
| 8 | **Slow scroll-reveal on older Safari/Firefox** | `animation-timeline: view()` isn't universally supported. Consider adding a `@keyframes` + `IntersectionObserver` JS fallback |
| 9 | **72KB CSS loaded on homepage** | Split global CSS; move page-specific code into scoped `<style>` blocks |
| 10 | **Loading atom pill color deviation from spec** | Spec says purple orbits, green is present. Verify with client if green pills are intentional |
| 11 | **Tagline `white-space: nowrap` may overflow at intermediate viewports** | Add a transition breakpoint between 640px and ~768px |

### 🎨 Polish Phase

| # | Issue | Why |
|---|-------|------|
| 12 | **No scroll-down indicator below CRT hero** | Users may not know there's more content |
| 13 | **No "skip intro" button for keyboard users** | 18s animation is long to wait |
| 14 | **Power button clickable during boot sequence** | A user accidentally clicking during intro sees "GOODBYE, HUMAN." |
| 15 | **No social proof on homepage** | Testimonials or review badges build trust for a repair business |
| 16 | **Google Fonts loading not preloaded** | Add `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` in `<head>` |
| 17 | **Keyframe/`steps()` choppiness on high-refresh displays** | Consider increasing steps from 3 to 6-8 on loading atom animation |
| 18 | **`mix-blend-mode: screen` fallback for old browsers** | Not critical, but a fallback background-color would prevent solid white rectangles |

---

## 11. No-Fix Confirmation

✅ **No source files were edited.**

✅ **No Git state was mutated.**
- No commits, no stashing, no restoring
- Working tree remains dirty (4 modified + 15 untracked files, as noted in section 3)

✅ **No auto-fix commands were run.**
- `pnpm format` was NOT executed despite 4 files failing format check
- No lint auto-fix was triggered

✅ **Investigation-only audit.** All findings are observations and recommendations only.

---

*Audit performed: 2026-05-11 02:02-02:30 UTC*
*Auditor: Hermes Agent — DeepSeek model*
*Scope: Homepage only (src/pages/index.astro and directly-related files)*
