# Homepage Audit Response & Disposition — 2026-05-11

> This document records the project owner's disposition decisions on findings from the
> Homepage Forensic Audit (2026-05-11) and the Homepage Creative Design Audit (2026-05-11).
>
> Each finding is classified as: **APPROVED** (implement as recommended), **MODIFIED**
> (approved with condition/changes), **DISCUSS** (needs strategy discussion first),
> **DECLINED** (intentional, will not fix), or **DEFERRED** (save for later phase).

---

## 1. Immediate Fix Items

### 1.1 Remove `crt-anim-motto` Class
- **Source:** Forensic Audit §4.3, §7.6
- **Disposition:** APPROVED
- **Action:** Remove the `crt-anim-motto` class from `src/pages/index.astro` line 9. The class has no matching CSS rule.

### 1.2 Duplicate Font File
- **Source:** Forensic Audit §6.3
- **Disposition:** APPROVED — but verify before cutting
- **Action:** Verify `src/assets/fonts/"Early GameBoy.ttf"` is not referenced by any import or CSS rule. If confirmed unused, delete `src/assets/fonts/` directory. The live copy in `public/fonts/` is the serving source.

### 1.3 Prettier Formatting on 4 Files
- **Source:** Forensic Audit §3
- **Disposition:** APPROVED — quick fix
- **Action:** Run `pnpm format` to auto-format `CrtTaskbar.astro`, `CrtTypingLabel.astro`, `index.astro`, and `global.css`.

---

## 2. Design Spec Deviations

### 2.1 Aspect Ratio: 16:9 vs 3:2
- **Source:** Forensic Audit §5.1, Creative Audit §3.1
- **Disposition:** MODIFIED
- **Owner response:** 16:9 was a deliberate choice — 3:2 "didn't look right." Will experiment with different ratios to find a balance.
- **Status:** Deferred pending owner experimentation.

### 2.2 Green Orbit Highlights & Loading Pill Colors
- **Source:** Forensic Audit §5.6, Creative Audit §3.2, §3.3
- **Disposition:** DECLINED (intentional)
- **Owner response:** Green, pink, and orange were added deliberately to add visual variety. The all-purple original looked "bland." Open to finding better shades that complement the color scheme.
- **Note:** Screen purple needs to be slightly brighter — current shade is too dark.

### 2.3 Bezel Filter Dimming on Load
- **Source:** Creative Audit §3.4
- **Disposition:** MODIFIED (intentional concept, implementable)
- **Owner response:** The dimming is intentional — light should appear to come from the screen. The implementation could be improved.
- **Action:** Keep the concept, improve the execution so the bezel doesn't look ugly during initial paint.

### 2.4 All Other Spec Deviations
- **Source:** Multiple
- **Disposition:** DECLINED (all intentional)
- **Owner response:** Every deviation from the formal spec was deliberate. The original design spec did not translate well to production. All colors, ratios, wording, and fonts were chosen intentionally. The design spec will be updated to reflect reality.

---

## 3. Accessibility & Navigation

### 3.1 Skip-to-Content Link
- **Source:** Forensic Audit §8.3, §9.1
- **Disposition:** APPROVED — Momentum Skip method
- **Owner response:** Use the momentum skip approach. When skip-link is activated, compress remaining intro into a 0.8-1s accelerated sequence with opacity fading — the user sees a brief "blur" of the animation resolving into stable state.
- **Action:** Implement momentum skip — accelerated compressed timeline on skip-link activation.

### 3.2 Scroll-Down Indicator
- **Source:** Forensic Audit §8.2, Creative Audit §7.1
- **Disposition:** APPROVED
- **Action:** Add a subtle animated amber chevron or pulsing dot below the CRT bezel to indicate scrollable content below.

### 3.3 Back-to-Top Button
- **Source:** Forensic Audit §4.5
- **Disposition:** APPROVED — must fit the theme
- **Action:** Implement a CRT-themed back-to-top button that appears after scrolling past the hero section.

### 3.4 Power Button Visual Feedback
- **Source:** Creative Audit §5.6
- **Disposition:** APPROVED
- **Owner response:** Power button should darken or glow when mouse approaches to telegraph its interactivity.
- **Action:** Add hover glow/darkening to the power button.

---

## 4. Performance & Optimization

### 4.1 CSS Bundle Size — Structural Optimization
- **Source:** Forensic Audit §6.1
- **Disposition:** APPROVED (comprehensive restructure)
- **Owner response:** Extract the 3 heaviest global blocks into their own files (glitch system, CRT hero animations, scroll-reveal). Also move any other blocks that "should" be in their own files. Goal: professional architecture with logical exceptions.
- **Action plan:**
  - Extract glitch CSS (~500 lines) from `global.css` into `CrtHero.astro`'s scoped `<style>` — only used there
  - Move scroll-reveal CSS into `index.astro`'s scoped `<style>` — only homepage uses it
  - Move CRT hero shared animations into `global.css` OR a dedicated shared-animations file
  - Keep in `global.css`: design tokens, font declarations, base structural styles, utility classes, footer
  - Goal: homepage drops from 72KB to ~35KB, other pages ~12-15KB

### 4.2 Animation Weight — Low-End Devices & Battery
- **Source:** Forensic Audit §5.2, §5.3
- **Disposition:** APPROVED — `prefers-reduced-computing` / battery-aware approach
- **Owner response:** Use `prefers-reduced-motion` as proxy for low-end/battery mode. When active, simplify atmosphere layers (remove bands animation, reduce scanline opacity, flatten tint). The site must look great and function correctly on ALL devices — not just high-end. Full-featured version is the primary experience, but the site's core purpose (impress customers, communicate message) must survive any browser or device limitation.
- **Action:** Add contextual simplification rules to the existing `prefers-reduced-motion` block. CRT still looks like a CRT — compositing drops ~60%.

### 4.3 `will-change` Declaration Count
- **Source:** Forensic Audit §5.7
- **Disposition:** APPROVED — Option 1: Targeted additions
- **Owner response:** Chose Option 1 (targeted `will-change` additions) after reviewing options breakdown.
- **Action:** Add `will-change` to these 5 elements:
  - `.crt-screen` → `opacity, filter`
  - `.crt-bands` → `background-position`
  - `.crt-metal` → `background`
  - `.crt-power-bloom` → `transform, opacity`
  - `.crt-content` → `opacity`
- **Do NOT add** `will-change` to glitch overlay layers (only active briefly).

### 4.4 `setTimeout` Drift Risk
- **Source:** Forensic Audit §5.4
- **Disposition:** APPROVED — CSS `animation-delay` for core + single setTimeout fail-safe
- **Owner response:** Use CSS `animation-delay` for the main timeline (~10 phases: loading → power bloom → atom reveal → typing → divider → stable). Keep ONE single `setTimeout` as a fail-safe timer that fires at (total duration + 3s) and force-transitions to stable state if anything went wrong. Discussion confirmed this is the right architecture — not overkill.
- **Action:**
  - Convert main intro timeline from JS `setTimeout` chain to CSS `animation-delay` on phase class toggles
  - Keep JS only for glitch sub-timeline (brief, timing doesn't cascade)
  - Add single fail-safe `setTimeout` at `totalDuration + 3000ms` as recovery net

---

## 5. Animation & Visual Effects

### 5.1 Glow Settle Animation (Dead Code)
- **Source:** Creative Audit §3.6
- **Disposition:** APPROVED — must fix
- **Owner response:** Must have been broken during a change. Needs to be fixed and working.
- **Action:** Replace `display: none` with `opacity: 0` on `.crt-glow-settle` so the animation is visible. Tune timing to match the wordmark glow sequence.

### 5.2 Loading Atom Redesign
- **Source:** Forensic Audit §5.5, §5.6; Owner response
- **Disposition:** MODIFIED
- **Owner response:** The loading atom was a placeholder that never worked right. Two options:
  - **Option A:** Remove pills, create a high-quality pixel version of the main atom symbol that spins, with a clean spin animation that matches the sequence timing.
  - **Option B:** Keep the pixel atom static and add a pixel "Loading..." text with subtle animation.
- **Action:** Owner leaning toward Option A. Needs concrete design before implementation.

### 5.3 Intro Timing Tightening (18s → ~14.8s)
- **Source:** Creative Audit §9.1
- **Disposition:** APPROVED
- **Action:** Tighten the intro sequence per the timing table in the Creative Audit. Key changes:
  - Power bloom: 450-2800ms (was 450-3600ms)
  - Typing: 3800-6400ms (was 4700-7420ms)
  - Total: ~14.8s instead of ~18.04s

### 5.4 Band & Flicker Timing Offset
- **Source:** Creative Audit §9.2
- **Disposition:** APPROVED
- **Action:** Offset band roll to 10.7s and CRT flicker to 7.6s to prevent accidental sync/pulsing.

### 5.5 Corner Brackets — Stable State & Reduced Motion
- **Source:** Creative Audit §5.2, §5.3
- **Disposition:** MODIFIED
- **Owner response:** Corner brackets faded because they overlapped the taskbar bottom. OK to bring them back if bottom brackets are lowered below the taskbar. OK to keep visible in reduced motion.
- **Action:** Restore corner bracket visibility in stable state at low opacity (0.15-0.2). Lower bottom brackets to clear the taskbar. Enable for reduced motion.

### 5.6 CRT Screen Curvature
- **Source:** Creative Audit §8.2
- **Disposition:** APPROVED
- **Owner response:** Liked the idea but don't overdo it. Going for retro-futurist vibe, not full retro discipline.
- **Action:** Add subtle `perspective` + slight CSS curvature to screen. Must be barely perceptible.

### 5.7 Glitch Sequence Timing & User Engagement
- **Source:** Forensic Audit §8.4, Owner response
- **Disposition:** APPROVED with enhancements
- **Owner response:** Keep glitches. Add a "system error" message during the first glitch that implies MAD LABS caught and is fixing the problem (e.g. "SYSTEM GLITCH DETECTED: IMPLEMENTING MAD LABS PROTOCOL #42"). Add a confirmation message after the second glitch during the reset sequence that implies MAD LABS successfully solved it (e.g. "MAD LABS PROTOCOL #42 — GLITCH CONTAINED. SYSTEM RESTORED."). The confirmation appears under the MAD LABS wordmark or on the screen after restore, then fades before the sequence finishes. The timeline savings (~3.2s) provide room for this. No need to kill glitches on scroll — user won't see them anyway. Power button behavior during glitch already handled by existing guard rails.
- **Action:** Add glitch narrative — protocol message (first glitch) + success confirmation (post-glitch restore). Timed to fit within the tightened ~14.8s timeline.

---

## 6. Atmosphere & Textures

### 6.1 Bezel Plastic Grain Texture
- **Source:** Creative Audit §5.1
- **Disposition:** APPROVED
- **Action:** Add subtle `repeating-linear-gradient` or noise pattern at very low opacity (0.03-0.05) to the bezel for physical plastic grain.

### 6.2 Diagonal CRT Glare Band
- **Source:** Creative Audit §5.4
- **Disposition:** APPROVED
- **Action:** Replace current static glare semi-ellipse with a diagonal glare band using `clip-path` or an angled gradient.

### 6.3 Vignette z-index Swap
- **Source:** Creative Audit §6.1
- **Disposition:** APPROVED
- **Action:** Swap z-index 19 (vignette) and 20 (scanlines) so vignette sits above scanlines for stronger corner darkening.

### 6.4 Bevel-Inner-Shadow Radius
- **Source:** Creative Audit §6.3
- **Disposition:** APPROVED
- **Action:** Match bevel-inner-shadow border-radius to screen radius (~30px) so the channel frames the screen evenly.

### 6.5 `.crt-noise` Investigation
- **Source:** Forensic Audit §4.3
- **Disposition:** DECLINED (removed)
- **Owner response:** `.crt-noise` is 100% dead code — the class exists only as a selector in the reduced-motion block with no matching HTML element and no CSS definition. Remove it. Will add actual static noise in a future phase.
- **Action:** Delete the `.crt-noise` reference from `global.css` reduced-motion block.

### 6.6 Ambient Screen Glow Spill
- **Source:** Creative Audit §7.2
- **Disposition:** APPROVED
- **Action:** Add subtle purple/ambient glow spill that transitions between the CRT hero and the first content section below.

---

## 7. Creative Additions — Approved

| # | Addition | Priority |
|---|----------|----------|
| 1 | Skip Intro button (appears ~3s into intro) | High |
| 2 | SVG atom favicon | High |
| 3 | Initial state looks "on" from frame 1 | High |
| 4 | Mouse-responsive screen glare | High |
| 5 | Link hover ripple on taskbar | Medium |
| 6 | Orbit electrons (glowing dots on atom paths) | Medium |
| 7 | Subtle ambient particles inside screen | Medium |
| 8 | Typing sound restoration + CRT hum sound | Medium |
| 9 | Power LED pulsing during boot | Low |
| 10 | Power supply idle glow in off state | Low |
| 11 | Soft light spill below CRT section | Low |
| 12 | Scroll-down indicator | High |
| 13 | Back-to-top button (themed) | High |
| 14 | CRT glow echo in footer | Low |
| 15 | Diagonal screen glare band | Medium |
| 16 | Bezel plastic texture grain | Medium |

### Deferred / Skipped

| Item | Reason |
|------|--------|
| Divider micro-typing effect | Experiment later, enough to do now |
| CRT warm-up color shift | Skip — improve existing instead |
| Typewriter cursor after tagline | Save for easter egg phase |
| Degauss button easter egg | Save for later phase |

---

## 8. Audio

### 8.1 Typing Sound Restoration
- **Source:** Owner response
- **Disposition:** MODIFIED — oscillator approach + mute button
- **Owner response:** Go with the oscillator approach (Web Audio API generated tones). Sound must play regardless — don't wait for user click. Either force the sound or scrap it. Prefers forcing it (respecting browser mute). Add a mute button somewhere on the screen — a volume button on the monitor housing would be cool.
- **Action plan:**
  - Create a shared `AudioContext` on page load (gets created suspended)
  - Use `AudioContext.resume()` on the FIRST user gesture to un-suspend
  - For users with autoplay blocked: the AudioContext remains suspended; the typing animation plays silently (the oscillators are scheduled but won't output). This is graceful — no error, no broken experience, just silent.
  - Generate typing sound via oscillator: short blip at ~800Hz, 50ms duration, slight decay envelope per letter
  - Generate CRT hum via oscillator: 60Hz + 120Hz sine waves mixed at very low gain, fades out as CRT stabilizes
  - Add a mute/unmute toggle styled as a physical button on the monitor casing (near power button area)
  - Add a volume level control integrated with the monitor design
- **Browser compatibility:** Works in all browsers that support Web Audio API (Chrome, Firefox, Safari 6+, Edge). Autoplay policy is the only blocker, handled by `resume()` on first gesture.

### 8.2 CRT Hum Sound
- **Source:** Creative Audit §8.1
- **Disposition:** APPROVED — via oscillator (see above)
- **Action:** Very subtle 60Hz + 120Hz oscillator mix, fades in during boot, fades out as CRT stabilizes. Controlled by same mute button.

---

## 9. Color & Styling

### 9.1 Screen Background Brightness
- **Owner response:** The current purple shade is slightly too dark. Needs to be brighter.
- **Action:** Experiment with moving from `#281845` toward `#332356` or a lighter purple.
- **Status:** Owner wants it brighter — exact shade TBD.

### 9.2 Green/Amber/Purple Color Balance
- **Owner response:** Keep green and pink as accent colors, but open to finding better shades. Current palette works but could be refined.
- **Action:** Evaluate color harmony and propose refined palette.

### 9.3 Amber Contrast (3.5:1 Ratio on Dark Backgrounds)
- **Source:** Forensic Audit §9.5
- **Disposition:** APPROVED — bump to `#e89050` + text-shadow glow
- **Owner response:** Bump amber to `#e89050` for the base color AND add a text-shadow glow to brighten the effective contrast. Keep the visual feel.
- **Action:** Update `--lab-accent` to `#e89050`. Add text-shadow glow to amber text elements.

### 9.4 Page Sections Below Hero Are Too Dark
- **Source:** Creative Audit §10.1
- **Disposition:** APPROVED
- **Owner response:** Agreed.
- **Action:** Lighten the section backgrounds and add the radial-gradient transition as suggested.

### 9.5 Tagline Warm Amber Glow
- **Source:** Creative Audit §5.5
- **Disposition:** APPROVED
- **Action:** Add warm amber glow to tagline to tie it visually to the divider and taskbar amber accents.

---

## 10. CSS & Structure

### 10.1 `@supports (animation-timeline: view())` — Scroll Reveal
- **Source:** Forensic Audit §7.2
- **Disposition:** APPROVED — CSS + JS dual approach
- **Owner response:** Keep the CSS `@supports` rule as primary. Add JS-powered `IntersectionObserver` fallback as an inline `<script is:inline>` in `index.astro` — no JS bundle added.
- **Action:** Implement the IntersectionObserver fallback (~15 lines) in `index.astro` as shown in the discussion.

### 10.2 Google Fonts Strategy
- **Source:** Forensic Audit §6.2
- **Disposition:** APPROVED — Self-host WOFF2
- **Owner response:** Self-host all three Google Fonts (Monofett, Jersey 25, VT323) as WOFF2 files in `public/fonts/`. Declare via `@font-face` in `global.css`. Remove the `@import` from Google. Add preconnect hints as interim measure before self-hosting is complete.
- **Action:**
  - Download Monofett, Jersey 25, and VT323 as WOFF2
  - Place in `public/fonts/` alongside Early GameBoy
  - Add `@font-face` declarations in `global.css` with `font-display: swap`
  - Remove `@import url("...fonts.googleapis.com...")` from `global.css`
  - Add `<link rel="preconnect">` hints to `BaseLayout.astro` as interim optimization

### 10.3 Overflow at Intermediate Viewports (640-768px)
- **Source:** Forensic Audit §9.8
- **Disposition:** APPROVED — raise wrap breakpoint
- **Owner response:** Raise the `white-space: normal` breakpoint from 640px to 820px to eliminate the gap where `nowrap` could overflow.
- **Action:** Change `@media (max-width: 640px)` rule for `.crt-tagline` to `@media (max-width: 820px)`.

### 10.4 `prefers-reduced-motion` Cleanup
- **Source:** Forensic Audit §9.4
- **Disposition:** APPROVED — restructure into shared non-scoped stylesheet
- **Owner response:** Move ALL reduced-motion override CSS out of component scoped `<style>` blocks into a shared non-scoped stylesheet (`global.css` or new `reduced-motion.css`). This eliminates the Astro `data-astro-cid-` specificity war and removes the need for `!important`. Verify no unintended consequences.
- **Action:**
  - Extract all `@media (prefers-reduced-motion: reduce)` blocks from CrtHero.astro, CrtTypingLabel.astro, CrtDivider.astro, CrtTaskbar.astro, and global.css
  - Consolidate into one `@media (prefers-reduced-motion: reduce)` block in a shared non-scoped location
  - Remove all `!important` declarations — class + `html.is-reduced-motion` scope provides sufficient specificity in non-scoped CSS
  - Verify no regressions by testing with `prefers-reduced-motion: reduce`

### 10.5 `!important` Overrides in Reduced Motion
- **Source:** Forensic Audit §9.4
- **Disposition:** APPROVED — eliminated via architectural change (see §10.4)
- **Owner response:** Moving reduced-motion CSS to a non-scoped stylesheet eliminates the specificity war entirely. No `!important` needed.

---

## 11. Power Button & Shutdown

### 11.1 Power Down Sequence — First-Time Visitor Experience
- **Source:** Forensic Audit §8.4
- **Disposition:** APPROVED with enhancements
- **Owner response:** Keep power button active at all times. If clicked during intro, show a "We're sorry to see you go! — ARE YOU SURE?" overlay on the CRT screen with Yes/No buttons. Yes → plays the goodbye human shutdown sequence. No → plays a victory moment: a brief victory sound + glow up (nothing huge — just a screen brighten/glow that signals "the monitor is happy you stayed"). Add a visual brightness change on hover (already approved in §3.4). Skip-intro button and shorter timeline reduce accidental-click window significantly.
- **Action:**
  - Add "ARE YOU SURE?" overlay with Yes/No buttons triggered on power button click during intro
  - Yes path: existing shutDownMonitor() sequence
  - No path: brief victory glow effect + optional sound
  - Add hover glow/brightness change to power button (pre-click telegraph)

### 11.2 Power LED Behavior
- **Source:** Creative Audit §5.7
- **Disposition:** APPROVED
- **Action:** Add subtle pulse animation to the power LED during the boot sequence (0-18s of intro).

### 11.3 Power Supply Idle Glow (Off State)
- **Source:** Creative Audit §5.8
- **Disposition:** APPROVED
- **Action:** Add a very faint `#080810` to `#020203` pulsing at 25-30s intervals during the `.is-powered-off` state.

---

## 12. Social Media & Reviews

### 12.1 Review Shower / Social Proof
- **Source:** Forensic Audit §8.7
- **Disposition:** APPROVED — layout design agreed, wait for content
- **Owner response:** Agreed with the two-column layout (reviews left, CTA right). However, do NOT render anything until actual review content and social media accounts exist. No placeholders, no "Coming Soon" — show nothing until real content is provided.
- **Action:**
  - Design the review/social components with the layout structure ready
  - Component is built but gated behind a content flag — renders nothing until reviews array has entries
  - Social media links gated behind a config with actual URLs
  - Same component structure reused on Contact page
  - When ready, populate with real reviews and social links

---

## 13. Rejected / Superceded Findings

| Finding | Reason |
|---------|--------|
| Design spec color deviations | All intentional — spec will be updated |
| Aspect ratio 3:2 | 16:9 was deliberate choice |
| Green orbit highlights | Intentional accent color |
| Bezel loading dimming | Intentional — can be improved, not removed |
| Any finding referencing the formal spec as authority | Spec is out of date — production is source of truth |

---

## Appendix: Decision Log — All Items Resolved

All open discussion items from the two audits have been resolved in this session. The full set of decisions, dispositions, and action items is recorded throughout this document. No further discussion items remain open.

| § | Topic | Status |
|---|-------|--------|
| A | Skip-link implementation | APPROVED — momentum skip |
| C | `.crt-noise` evaluation | DECLINED — removed (dead code) |
| D | CSS bundle size | APPROVED — structural optimization plan |
| E | Low-end device strategy | APPROVED — prefers-reduced-motion as proxy |
| F | `will-change` strategy | APPROVED — Option 1: targeted additions |
| G | `setTimeout` drift mitigation | APPROVED — CSS animation-delay + fail-safe timer |
| H | Glitch vs engagement | APPROVED — protocol narrative added |
| I | Typing sound investigation | APPROVED — oscillator approach + mute button |
| J | Amber contrast (3.5:1) | APPROVED — bump to `#e89050` + text-shadow glow |
| K | Scroll-reveal hardening | APPROVED — CSS + IntersectionObserver fallback |
| L | Google Fonts strategy | APPROVED — self-host WOFF2 |
| M | Intermediate viewport overflow | APPROVED — 820px breakpoint |
| N | `!important` in reduced-motion | APPROVED — consolidated non-scoped stylesheet |
| O | Power button first-time UX | APPROVED — "ARE YOU SURE?" overlay + victory glow |
| P | Reviews & social media layout | APPROVED — build gated components, wait for content |

---

*Document generated: 2026-05-11*
