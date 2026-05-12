# Homepage Creative & Visual Design Audit — 2026-05-11

## 1. Executive Summary

**Focus:** Visual polish, animation quality, design cohesion, professional appearance, and creative improvements.

**Verdict:** The homepage is visually striking with a strong retro-futurist CRT concept and well-executed animation narrative. However, several design spec deviations, dead visual code, layering inconsistencies, and missed polish opportunities hold it back from feeling truly premium. The core concept is excellent — it just needs tightening, consistency, and a few creative additions.

**This audit does not cover:** Performance, accessibility, or technical correctness (see Homepage Forensic Audit 2026-05-11 for those). This is purely about how it *looks* and *feels*.

---

## 2. Files Inspected

| File | Role in Creative Design |
|------|------------------------|
| `src/components/CrtHero.astro` | CRT monitor — bezel, screen, atom, atmosphere layers, all animations (~2114 lines) |
| `src/components/CrtTypingLabel.astro` | "MAD LABS" wordmark typing effect, glow settle |
| `src/components/CrtDivider.astro` | Warm amber divider line with `< / >` mark |
| `src/components/CrtTaskbar.astro` | Nav bar at screen bottom |
| `src/layouts/BaseLayout.astro` | Document shell — head, footer, slot |
| `src/pages/index.astro` | Homepage layout — CRT hero + body sections |
| `src/styles/global.css` | Design tokens, shared animations, glitch system, scroll-reveal |
| `src/styles/global.css` (Tailwind v4) | Design tokens reference |
| `docs/AUDITS/Homepage-Audit-2026-05-11.md` | Prior forensic audit (referenced for context) |
| Homepage built HTML (curl) | Actual rendered structure |

---

## 3. Design Spec Deviations

### 🔴 3.1 CRT Screen Aspect Ratio: 16:9 vs 3:2

**Location:** `CrtHero.astro` line 576
```css
aspect-ratio: 16 / 9;
```

**Spec says:** `aspect-ratio: 3 / 2`

**Visual impact:** 16:9 is a modern widescreen ratio — it makes the CRT look like a flatscreen monitor, not a retro CRT. The 3:2 ratio is noticeably taller and squarer, evoking the classic CRT monitors of the 80s-90s (Sony Trinitron, Apple Macintosh, etc.). This is the single most impactful visual fix you can make.

**Creative note:** A 3:2 screen gives more vertical space for the content stack (atom → wordmark → divider → tagline → taskbar), reducing the cramped feeling on desktop.

---

### 🟡 3.2 Atom Orbit Color: Green Instead of Purple

**Location:** `CrtHero.astro` lines 1235-1237
```css
--atom-glow-orange: #ff9d3d;
--atom-glow-pink: #ff4fd8;
--atom-glow-green: #00f07a;
```

**Spec says:** "Purple orbits with white glow (NOT green)." The third orbit highlight should be purple, not green.

**Visual impact:** The green orbit (#00f07a) clashes with the purple screen (#332356). The orange/pink/green trio creates a traffic-light RGB aesthetic that belongs on a gaming PC, not a professional IT repair business. A purple/magenta/warm-white trio would be more cohesive with the brand's purple/amber color story.

**Suggestion:** Replace green with `#b388ff` (soft purple) or `#e8a0ff` (orchid) — keeping all three orbits in the purple family at different luminance levels.

---

### 🟡 3.3 Loading Atom Pills Use the Same Green

**Location:** `CrtHero.astro` lines 944-946
```css
.loading-atom-pill--green {
  fill: #00f07a;
}
```

Same green color present on the pre-boot loading atom. If the spec calls for purple-only, this should change too.

---

### 🔴 3.4 Bezel Filter Dims the Beige During Loading

**Location:** `CrtHero.astro` line 518
```css
.crt-bezel {
  filter: brightness(0.78) saturate(0.9) drop-shadow(0 24px 68px rgba(0, 0, 0, 0.76));
}
```

**Visual impact:** When the page first loads, the bezel has `brightness(0.78)` applied, making the beige CRT casing look dark gray and dingy — NOT the warm retro beige described in the spec (`#d0ccc9`). The beige only appears at full saturation after `is-powering-on` fires (line 522-530).

**Problem:** Users who see the page in the first 450ms (or on slow connections/reloads) see an ugly dark-colored CRT housing. The bezel should start at full brightness and be visually appealing from the very first frame.

---

### 🟡 3.5 Screen Background Darker Than Spec

**Location:** `CrtHero.astro` lines 598-609
```css
.is-powering-on .crt-screen {
  background: #281845;
}
```

**Spec says:** `#332356` (listed in `global.css` line 28 as `--crt-screen-bg`)

**Visual impact:** `#281845` is noticeably darker than `#332356`. The screen should be a "bright lavender/purple" per the spec. The current color is closer to a deep eggplant. This affects the entire visual feel — the CRT would look more vibrant and retro with the lighter, brighter purple.

---

### 🔴 3.6 Glow Settle Animation Is Dead Code

**Location:** `CrtTypingLabel.astro` lines 105-107
```css
.crt-glow-settle {
  display: none;
}
```

**Lines 109-111:**
```css
:global(.is-title-glowing) .crt-glow-settle {
  animation: crtGlowSettle 1.04s ease-in-out both;
}
```

**The problem:** The `.crt-glow-settle` element (line 22, a `<span>` with `aria-hidden="true"`) has `display: none` directly on it. CSS animations **cannot override `display: none`**. The `animation` property is applied but the element remains invisible. The entire `crtGlowSettle` keyframe is completely dead — it never renders.

**Visual impact:** After the wordmark finishes typing (at 7.42s), there should be a pulsing glow settle effect around "MAD LABS." Instead, nothing happens — the wordmark goes directly from its typing position to the glow animation on `.crt-wordmark` (`crtWordmarkFinalGlow`), but the settle overlay that adds a separate glow layer never appears.

---

## 4. Animation & Timing Analysis

### 4.1 Overall Sequence Quality

The 18-second intro sequence is well-choreographed with a clear dramatic arc:

| Time | Phase | Quality |
|------|-------|---------|
| 0ms | Loading atom spins | Good — sets up anticipation |
| 450ms | Power bloom expands | Very good — dramatic center burst |
| 3600ms | Atom fades in | Good — natural transition |
| 4700ms | Wordmark typing begins | Good — steps timing creates typewriter feel |
| 7420ms | Wordmark glow settle | **BROKEN** — dead code (see 3.6) |
| 8600ms | Divider lines march in | Good — clean line animation |
| 9480ms | Divider mark opens | Good — smooth reveal |
| 11100ms | Flicker pop | Good — subtle screen electricity |
| 11320ms | Minor glitch | Good — brief static |
| 14040ms | Major glitch (twin burst) | **EXCELLENT** — dramatic centerpiece |
| 15400ms | Restore + tagline/taskbar | Good — satisfying recovery |
| 16900ms | Final proud glow | **EXCELLENT** — warm closing |
| 18040ms | Stable state | Good |

---

### 4.2 Glow Settle Gap

**Critical gap:** Between the wordmark typing ending (~7s) and the divider building starting (8.6s), there's a 1.6-second window where the wordmark should have a "glow settling in" effect — light pulsing outward from the letters. This is explicitly designed by the `crtGlowSettle` and `crtWordmarkFinalGlow` keyframes but the settle overlay is broken (see 3.6). Repairing this would add a noticeable quality bump.

---

### 4.3 Loading Atom Pill Position vs Orbit Rotation

**Location:** `CrtHero.astro` SVG lines 63-70, CSS lines 898-901, 928-950

**Design issue:** The loading atom has three orbiting pills (orange, pink, green) that appear to be small particles. However, due to the SVG structure, the pills are **siblings** to the orbiting group, not children of it:

```svg
<g class="loading-atom-orbits"><!-- ellipses --></g>
<g class="loading-atom-pills"><!-- circles --></g>
```

The `.loading-atom-orbits` group rotates continuously (`crtLoadingAtomTurn 7.8s linear infinite`). The pills wobble in place with 1.8s step animations. The pills **do not ride the orbits** — they sit near the center and quiver while the orbit lines spin beneath them.

**Creative suggestion:** The pills should orbit around the atom center along the actual orbit paths. This would require either:
- (Surgical fix) Encapsulate each pill in the rotated group with per-orbit positioning
- (Better approach) Convert the pills to orbiting `circle` elements with animated `cx`/`cy` or use SVG `<animateMotion>` elements

This would make the loading animation significantly more convincing.

---

### 4.4 3-Step Animations on High Refresh Displays

**Location:** `CrtHero.astro` lines 888, 958, 967
```css
animation: crtLoadingAtomIdle 1.08s steps(3, end) infinite;
animation: crtLoadingNucleusPulse 1.08s steps(3, end) infinite;
animation: crtLoadingCorePulse 1.08s steps(3, end) infinite;
```

**Visual impact:** On 120Hz+ displays, 3-step animations over 1.08s mean each step lasts only ~3-4 frames. This creates a visible stutter/jerk rather than a smooth pulse. Consider increasing to 6-8 steps or converting to `ease-in-out` for smoother transitions.

---

### 4.5 Glitch Timing — Could Extend the "Unstable" Moment

The major glitch sequence (14.04s-15.4s) lasts only 1.36 seconds total. Given it's the dramatic centerpiece of the intro, this could be extended to ~2.5s for more impact:

- First burst (390ms) → brief settle → second burst (520ms) → aftershock tremble (800ms) → restore

The current twin burst at 560ms gap is good, but adding a brief "aftershock" phase where the screen trembles before fully restoring would sell the effect more convincingly.

---

## 5. Visual Element Quality & Detail

### 5.1 Bezel Texturing — Good Foundation, Missing Plastic Grain

**Current:** The bezel uses a vertical gradient (`#d7d0ca → #c9c2bc → #c3bcb6 → #b6b0ab`) with inset box-shadows for depth.

**Observation:** The bezel feels smooth — almost like painted plastic. Real retro CRT bezels (especially beige ones from the 80s/90s) had a subtle **textured/grained** plastic surface. Adding a very subtle noise texture or repeating micro-gradient would add the "physical object" feel.

**Suggestion:** A `repeating-linear-gradient` at 1px intervals with <1% opacity variation overlaid on the bezel, or a minimal `background-image` noise pattern at very low opacity (0.03-0.05).

---

### 5.2 Corner Brackets — Clean but Disappear in Stable State

**Location:** `CrtHero.astro` lines 1150-1193, CSS lines 1164-1168

```css
.is-major-glitching .crt-corner,
.is-restoring .crt-corner,
.is-stable .crt-corner {
  opacity: 0;
  transform: scale(0.92);
}
```

**Design choice:** The corner brackets fade to `opacity: 0` once the hero reaches stable state. This means after the 18-second intro, the corners disappear entirely. 

**Creative suggestion:** The corner brackets could remain subtly visible at low opacity (0.15-0.2) in stable state as a framing element. Right now the screen has no visual frame in stable state — the brackets are the only thing resembling CRT bezel corner edges. Even at 10% opacity, they would suggest "these are the corners of the monitor."

---

### 5.3 Corner Brackets on Reduced Motion

**Location:** `CrtHero.astro` reduced-motion block, line 2110-2112
```css
.crt-corner {
  opacity: 0;
}
```

Reduced-motion users NEVER see corner brackets. This makes the screen look unframed from the start. Consider keeping them at a low opacity even in reduced-motion mode.

---

### 5.4 The CRT Screen Glare

**Location:** `CrtHero.astro` lines 1056-1066

```css
.crt-glare {
  top: 0;
  right: 5%;
  left: 5%;
  height: 40%;
  border-radius: 0 0 60% 60%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, transparent 100%);
}
```

**Observation:** The glare is a simple semi-ellipse at the top of the screen. It's effective but basic. A more convincing CRT glare would be a **slightly curved band** (not a full semi-ellipse) at a slight diagonal, mimicking a fluorescent tube reflection on the glass.

**Suggestion:** Try a diagonal glare band instead:
- `clip-path: polygon(8% 0%, 92% 0%, 86% 36%, 14% 36%)` + subtle rotation
- Or break into two glare elements: a wide diffuse top glow + a thin sharp diagonal band

---

### 5.5 Tagline Text Shadow

```css
text-shadow:
  0 0 8px rgba(216, 180, 254, 0.4),
  0 0 18px rgba(147, 51, 234, 0.25);
```

The tagline glow is purple, which matches the screen but is the same color as the wordmark glow. A warm amber glow (`#d4854a`) for the tagline would tie it to the divider and taskbar amber accents, creating a more deliberate color hierarchy:
- Wordmark: purple glow (primary)
- Divider: amber glow (structural)
- Tagline: amber glow or minimal glow (tertiary/subtle)

---

### 5.6 Power Button Visual Quality

The power button is well-constructed with layered radial gradients and pseudo-elements. The depth is convincing. A few improvements:

- **Button animation on hover:** Currently, hovering the power button doesn't change its appearance (the cursor changes to pointer but no visual feedback). Adding a subtle brightening on hover would make it feel like a physical button being approached.
- **Press feedback:** The `:active` translateY(1px) is good but very subtle. Consider a brief shadow reduction to really sell the physical press.

---

### 5.7 Power LED Behavior

The green LED is currently static (always on when the CRT is on). In real hardware, the power LED often:
- **Pulses briefly** during boot sequence
- **Glows steady** in normal operation
- **Fades out** on shutdown

Adding a subtle pulse animation to the LED during the boot sequence (0-18s) would be a nice touch.

---

### 5.8 The CRT "Screen Is Off" State

The `.is-powered-off` state (lines 760-782) makes the screen `#020203` (near black) with muted shadows. This is a well-executed "dead monitor" look. The transition from shutdown bloom to dark screen is smooth.

**Creative suggestion for off state:** Consider adding a very faint, slow "power supply idle" glow — a subtle `#080810` to `#020203` pulsing at 25-30s intervals — to suggest the CRT is still connected to power (as real monitors do). When the `.is-powered-off` state is active, a barely-visible heartbeat suggests the monitor is asleep, not dead.

---

## 6. Atmosphere Layer Analysis

### 6.1 Layer Stack Order

Current z-index stack (bottom to top):

| z-index | Layer | Purpose |
|---------|-------|---------|
| 1 | `.crt-metal` | Screen background |
| 10 | `.crt-content` | Atom, wordmark, divider, tagline |
| 17 | `.crt-bevel-inner` | Recessed edge shadow |
| 18 | `.crt-glare` | Screen reflection (top) |
| 19 | `.crt-vignette` | Corner darkening |
| 20 | `.crt-scanlines` | CRT scan lines |
| 21 | `.crt-phosphor-dots` | Phosphor dot grid |
| 22 | `.crt-tint` | Purple soft-light overlay |
| 23 | `.crt-bands` | Horizontal interference bands |
| 25 | `.crt-taskbar-area` | Navigation bar |
| 30 | `.crt-corner`, power | Corner brackets, controls |
| 31-34 | Glitch layers | Chroma, static, tear, slices |
| 50 | `.crt-boot-overlay` | Boot sequence overlay |
| 70 | `.crt-shutdown-overlay` | Shutdown sequence |

**Creative observations:**

1. **Vignette (19) below scanlines (20):** The vignette darkens corners, but scanlines render ON TOP of it. This dilutes the vignette effect significantly — the scanline pattern (at 72% opacity) washes out the corner darkening. Consider swapping z-index 19 and 20 so the vignette sits above scanlines and below phosphor dots.

2. **Phosphor dots (21) above scanlines (20):** ✅ Correct — phosphor dots should be the topmost texture layer before tint/bands.

3. **Tint (22) above phosphor dots (21):** The soft-light purple tint sits above the dot texture. This means the dots are colored by the tint. ✅ This is physically accurate.

---

### 6.2 Screenshot: Visual Simulation (Code Analysis)

Without a working local browser, I've analyzed the CSS math for how the layers compose:

- The **scanlines** at `rgba(0,0,0,0.12)` with 2px on, 1px off pattern create 33% duty cycle lines. At 72% opacity, each scan line darkens the underlying content by ~8.6% — subtle enough to not be distracting but visible on solid color areas.
- The **phosphor dots** at `rgba(255,255,255,0.09)` with 3px spacing create a dim dot grid. At 21% the dot brightness is noticeable but not dominant.
- The **bands** at `rgba(255,255,255,0.012)` with 48px/2px pattern are extremely subtle — almost invisible on most content. They're perceptible on solid purple backgrounds as very faint moving lines.

**Assessment:** The subtlety is well-calibrated. These layers won't distract from content but add subconsciously to the CRT authenticity.

---

### 6.3 Bezel vs Screen Border Radius Mismatch

| Element | Border Radius |
|---------|---------------|
| Bezel outer | 24px |
| Bezel-rim | 20px |
| Bevel-inner-shadow | 34px |
| Screen | 30px |

**Design issue:** The bevel-inner-shadow has a LARGER radius (34px) than the screen (30px). This means the inner shadow channel doesn't neatly frame the screen — the channel's corners are rounder than the screen's corners, creating a visual gap at the corners where the transition between bezel and screen doesn't align.

**Suggestion:** Make the bevel-inner-shadow radius match or be slightly smaller than the screen radius. If the screen is 30px, the channel should be ~28-30px for a uniform framing effect.

---

## 7. Missing Visual Elements & Additions

### 7.1 Scroll-Down Indicator

There is no visual cue below the CRT hero to suggest there's more content. The CRT fills `100svh` and the 18-second intro ends with a beautiful stable CRT. Many users may not think to scroll.

**Suggested location:** Below the CRT bezel, centered, at the very bottom of the `.crt-hero` section (just above the next section). A subtle animated chevron or pulsing dot.

**Design:** Two small amber chevrons stacked vertically, animated to move up/down on a 2-3s loop, opacity 0.5, fading out on scroll after ~200px.

---

### 7.2 Ambient Screen Glow on Page Sections Below

The CRT hero has a `.hero-glow` element that casts a purple/amber glow in the background. This glow stops at the hero section boundary. Consider a very subtle purple glow that persists into or between the hero and the next section (`hero-sub`) — a soft light spill that suggests the CRT screen illuminates the space around it.

---

### 7.3 "Skip Intro" Button for Returning Visitors

The session storage mechanism (`madlabs:crt-hero-intro-seen`) already skips the intro on subsequent visits. But there's no manual "skip intro" button for users who want to bypass the 18-second animation on their first visit.

**Suggestion:** A small `[x] Skip` or `[Skip Intro]` link (like Netflix) that appears at ~3s into the intro and calls `showStablePoweredOnState()`. Styled as a tiny amber link in the top-right corner of the screen. Auto-hides after stable state.

---

### 7.4 CRT Reflection/Glint on the Bezel

The bezel is currently all matte plastic with no specular highlight. In the source business card reference, the bezel has a subtle sheen/gloss highlight on the top edge from overhead lighting. A very subtle highlight gradient or pseudo-element on the top bezel edge would add the "physical object under light" feel.

---

### 7.5 Favicon / Browser Tab Polish

The current favicon is a simple SVG at `/favicon.svg` (242 bytes). While functional, a dynamic or animated favicon that shows the MAD LABS atom logo would be a memorable touch.

**Suggestion:** A simplified atom SVG favicon with 3 orbits, small enough to be recognizable at 16×16. Alternatively, just the "M" from the wordmark.

---

### 7.6 Loading State / Skeleton Before Hero Initializes

The hero section relies on JavaScript to trigger the intro sequence. Between page load and the JavaScript executing (especially on slow connections), the user sees a brief flash of the hero in an unstyled/partially-styled state: the CRT bezel is dark (due to `filter: brightness(0.78)` — see 3.4), the screen is `#030304` black, and the boot overlay is full-opacity.

**Suggestion:** The initial state should already look "on" and intentional — the bezel at full brightness, the screen at proper purple, and the boot overlay fully opaque so the user sees a clean black screen that transitions into the power-on effect. This requires moving some styling out of `.is-powering-on` and into the base state.

---

## 8. Creative Additions — "Cooler" Ideas

### 8.1 Warm CRT "Hum" Sound

A very subtle 50Hz/60Hz CRT hum audio (barely audible — think fan noise level) during the loading phase that fades out as the CRT stabilizes. This is the single most impactful addition for atmosphere — the hum immediately tells the brain "this is a real CRT." Needs to be extremely subtle; the second a user notices it, it's too loud.

---

### 8.2 Screen Curvature Effect

Real CRT screens are NOT flat — they bulge outward slightly. A `perspective: 1200px` on the `.crt-screen` combined with a slight `rotateX(1deg)` or subtle `scaleY(0.995)` at the edges would create an imperceptible 3D curvature. Too much and it's a gimmick; at the right level, the user won't notice it consciously but will feel the screen is more "physical."

**Alternative:** A CSS `radial-gradient` overlay makes the edges appear slightly darker/bent by adjusting vignette intensity non-uniformly.

---

### 8.3 Micro-Typing for the Divider Mark

The `< / >` divider mark currently transitions from `max-width: 0` to `max-width: 5.8ch` with a `cubic-bezier` ease. Consider giving the characters themselves a micro-typing effect (one character at a time) — `<` appears, then ` / `, then `>` — each spaced by 100-150ms. This would mirror the wordmark's step animation and create a satisfying rhythm.

---

### 8.4 Atom Orbit Electrons

The stable atom has orbit highlight lines that pulse and rotate. Real atom diagrams often show small electrons ("balls") traveling along the orbits. Adding tiny glowing dots (could be 3px circles with drop-shadow) that travel the orbit paths would add motion interest.

**Implementation:** Use `stroke-dasharray` on a hidden circle that wraps visible segments, or add 3-4 small `circle` elements per orbit with `offset-path` animation (CSS Motion Path).

---

### 8.5 CRT "Warm-Up" Color Shift

When a real CRT monitor turns on, the screen doesn't immediately snap to full brightness — it fades in from a cold blue-white to warm operating temperature over ~500ms. The current power bloom is white → purple. Adding a brief blue-white flash before the purple takes over would mimic this physical behavior.

---

### 8.6 Subtle Ambient Particles in the Screen

Very small (1-2px) floating particles drifting slowly inside the CRT screen area — reminiscent of the "floaters" inside old CRT glass. This would be a JS-powered Canvas or absolutely-positioned divs with CSS animations. Must be **extremely** subtle — visible only if you're looking for it.

---

### 8.7 Mouse-Responsive Screen Glare

Using `mousemove` events to shift the screen glare position based on where the user's cursor is. The glare would move to follow the "virtual light source" direction. This adds surprising interactivity that delights users who notice it.

**Implementation:** Track mouse position relative to the hero section, clamp to bounds, and translate the glare layer by a small fraction (10-15px max movement). Needs `will-change: transform` and `requestAnimationFrame` throttling.

---

### 8.8 Link Hover Ripple on Taskbar

When hovering taskbar links, a subtle amber ripple that spreads from the point of hover — like a DOS terminal cursor blink — would feel incredibly on-brand. Could be a pseudo-element with `transform: scale()` animation on hover-in.

---

### 8.9 "Typewriter" Cursor After Tagline

After the tagline "Computer Repair, Tech Support, & AI Solutions" fades in, a blinking amber underscore cursor at the end (like a terminal prompt) that blinks indefinitely. When the user hovers the CRT with their mouse, a subtle color change on the cursor (brightens) suggests "you can interact here."

---

### 8.10 CRT "Degauss" Button Easter Egg

Old CRT monitors had a degauss button that briefly made the screen flash and wiggle to demagnetize the shadow mask. Adding a hidden degauss sequence triggered by a double-click on the power button or a specific key combination would be a fun easter egg.

---

## 9. Animation Timing Recommendations

### 9.1 Intro Timing Tightening

| Current | Suggested | Rationale |
|---------|-----------|-----------|
| 0-450ms: loading atom | No change | Good build-up |
| 450-3600ms: power bloom | 450-2800ms | 3.15s is too long for the bloom alone. Tighten to 2.35s. The bloom is beautiful but the user is staring at an expanding light for 3+ seconds. |
| 3600-4700ms: atom reveal | 2800-3800ms | Atom appears, user registers it, then wordmark starts. 1.1s is enough. |
| 4700-7420ms: typing | 3800-6400ms | 2.72s for 8 letters is ~340ms/letter. Still feels deliberate but not draggy. |
| 7420-8600ms: glow settle | 6400-7400ms | Tighten. The glow settle should overlap with the transition to divider building. |
| 8600-9480ms: divider build | 7400-8200ms | 880ms is enough for the line animation. |
| 9480-11100ms: divider open | 8200-9500ms | The mark reveal can be faster. |
| 11100-11320ms: flicker | 9500-9800ms | Brief electricity |
| 11320-14040ms: minor glitch | 9800-11000ms | Minor glitch doesn't need 2.7s. |
| 14040-15400ms: major glitch | 11000-12800ms | Keep the major glitch weight but tighten the approach. |
| 15400-16900ms: restore | 12800-14000ms | Faster recovery. |
| 16900-18040ms: final glow | 14000-14800ms | 1.14s for the proud glow is generous. 800ms is enough. |
| **Total: 18.04s** | **~14.8s** | **Saves ~3.2s without rushing any moment.** |

---

### 9.2 Stable State Animation Cadence

During stable state, these animations run concurrently:
- CRT flicker (8s)
- Neon flicker on atom (6s)
- Orbit spin (18s) 
- Orbit glow flow (5.2s) and pulse (1.9s)
- Nucleus shimmer (2.8s) and core shimmer (2.8s)
- Bands roll (10s in stable)

**Observation:** The band roll at 10s and the flicker at 8s have overlapping frequencies that may create a subtle moiré or sync pattern. Consider slightly offsetting them (10.7s for bands, 7.6s for flicker) to avoid accidentally syncing into a visible pulse pattern.

---

## 10. Color & Contrast Design Notes

### 10.1 Page Sections Below the CRT

The `.hero-sub`, `.what-we-do`, `.trust`, and `.cta` sections all use `var(--lab-surface)` (#120824) or `var(--lab-surface-alt)` (#1e1040) backgrounds. These are very dark — the contrast between the bright purple CRT screen and the near-black sections below is jarring.

**Suggestion:** Add a gradient transition between the hero background (black `#020305`) and the first content section. The CRT's ambient glow could bleed downward into the hero-sub section as a `radial-gradient` overlay.

---

### 10.2 Footer Color

The footer sits on `var(--lab-surface)` #120824 with muted text `#706888`. It's cohesive with the dark theme but could use a subtle CRT glow echo (amber or purple tint at very low opacity) to tie it back to the hero.

---

## 11. Summary of Findings

### 🔴 Design Spec Violations (Should Fix)

| # | Issue | Impact | Code Location |
|---|-------|--------|---------------|
| 1 | `aspect-ratio: 16/9` instead of `3/2` | Makes CRT look like modern flatscreen | CrtHero.astro:576 |
| 2 | Green orbit highlights instead of purple | Color clash with purple brand | CrtHero.astro:1295-1304 |
| 3 | Loading atom has green pill | Same color spec deviation | CrtHero.astro:944-946 |
| 4 | Bezel starts at `brightness(0.78)` | Beige casing looks dark/ugly on load | CrtHero.astro:518 |
| 5 | Screen `#281845` darker than spec `#332356` | Less vibrant CRT screen | CrtHero.astro:599 |
| 6 | Glow settle `display: none` kills animation | Wordmark glow settle never renders | CrtTypingLabel.astro:105-107 |

### 🟡 Design Quality Issues (Should Improve)

| # | Issue | Impact |
|---|-------|--------|
| 7 | Corner brackets disappear in stable state | Screen loses its visual frame |
| 8 | Corner brackets hidden in reduced motion | Same framing issue for a11y users |
| 9 | Bevel-inner-shadow radius (34px) > screen radius (30px) | Awkward corner gap in screen channel |
| 10 | Loading pills don't ride orbit paths | Loading animation less convincing |
| 11 | 3-step animations choppy on high-refresh displays | Stuttery loading animation |
| 12 | Vignette (z-index 19) below scanlines (z-index 20) | Vignette diluted by scanline overlay |
| 13 | Glare is a static ellipse — no diagonal band | Less realistic CRT glass reflection |
| 14 | Power button has no hover visual feedback | Dead feeling on interaction |
| 15 | Intro is ~18s — could be tightened to ~14.8s | Some phases feel stretched |

### 🎨 Creative Additions (Optional — "Make It Cooler")

| # | Idea | Effort | Cool Factor |
|---|------|--------|-------------|
| A | Subtle CRT hum audio | Medium | ★★★★★ |
| B | Screen curvature via perspective | Low | ★★★★ |
| C | Atom orbit electrons (particles on paths) | Medium | ★★★★ |
| D | Mouse-responsive screen glare | Medium | ★★★★★ |
| E | Scroll-down indicator below CRT | Low | ★★★★ |
| F | "Skip Intro" button | Low | ★★★★ |
| G | Typewriter cursor after tagline | Low | ★★★ |
| H | CRT warm-up color shift | Low | ★★★ |
| I | Taskbar link hover ripple | Low | ★★★ |
| J | Micro-typing for divider `< / >` | Low | ★★★ | 
| K | Ambient particles inside screen | Medium | ★★★ |
| L | Degauss button easter egg | Medium | ★★★★★ |
| M | Power LED pulsing during boot | Low | ★★ |
| N | Faint power-supply glow in off state | Low | ★★ |

---

## 12. No-Fix Confirmation

✅ **No source files were edited.**
✅ **No Git state was mutated.**
✅ **Investigation-only audit.** All findings are observations and recommendations only.

---

*Audit performed: 2026-05-11 02:36-03:30 UTC*
*Auditor: Hermes Agent — DeepSeek model*
*Scope: Creative/visual/design quality of homepage (index.astro, CRT components, global.css)*
*Bias: Design-forward, not technical.*
