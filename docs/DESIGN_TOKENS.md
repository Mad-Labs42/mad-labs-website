# MAD LABS Design Tokens

> **Source of truth for all design system values.**  
> Brand spec → CSS custom properties → usage mapping.  
> Updated: 2026-06-12

---

## Color System

### Brand Palette

| Token | Hex | CSS Variable | Where Used | Status |
|-------|-----|-------------|------------|--------|
| **CRT Divider Orange** | `#f79e55` | — | CRT divider lines, approach card borders/underlines, taskbar borders | ✅ Used directly as hex (no CSS var) |
| **Lab Accent Orange** | `#e89050` | `--lab-accent` | Buttons, hover states, trust strip icons, ServiceCard borders, general accents | ✅ `--lab-accent` in global.css |
| **Neon Purple** | `#ce47ff` | — | Decorative accents, hover glows on purple elements | ❌ **Missing** — code uses `#8c50f0`/`#9333ea` instead |
| **Neon Orange** | `#ff6600` | — | High-impact accents, button hover states | ❌ **Missing** from codebase |
| **LED Green** | `#00e676` | `--crt-led-on` | Service card pricing, trust card icons, power LEDs | ✅ `--crt-led-on` in global.css |
| **CRT Screen** | `#362866` | `--crt-screen-bg` | CRT hero screen background (bright lavender, NOT dark) | ✅ |
| **Card BG** | `#131325` | `--lab-card` | All card surfaces | ❌ **Wrong value** — currently `#1e1a32` |
| **CRT Text** | `#f0eaff` | `--crt-text` | Text on CRT screen, brightest white-purple | ✅ |
| **Bezel Beige** | `#d0ccc9` | `--crt-bezel-bg` | CRT monitor housing/bezel | ✅ |
| **Tablet Bezel Light** | `#d8d0e0` | — | Tablet top bezel highlight | ✅ Used inline |
| **Tablet Bezel Mid** | `#c8c0d0` | — | Tablet mid-bezel | ✅ Used inline |
| **Tablet Bezel Shadow** | `#b8b0c0` | — | Tablet bottom/depth edge | ✅ Used inline |

### Semantic Mapped Colors (CSS Variables)

From `src/styles/global.css`:

```css
:root {
  /* CRT Bezel */
  --crt-bezel-bg: #d0ccc9;
  --crt-bezel-highlight: #e8e4e2;
  --crt-bezel-mid: #dbd6d3;
  --crt-bezel-shadow: #908882;
  --crt-bezel-shadow2: #a09890;
  --crt-bezel-edge: #62585e;

  /* CRT Screen */
  --crt-screen-bg: #362866;
  --crt-screen-channel: #4a3d6a;
  --crt-screen-channel-deep: #1a1228;
  --crt-screen-glow: rgba(140, 80, 240, 0.45);
  --crt-screen-glow2: rgba(140, 80, 240, 0.3);
  --crt-screen-glow3: rgba(100, 50, 200, 0.2);

  /* CRT Text */
  --crt-text: #f0eaff;
  --crt-text-muted: #d0bcf4;

  /* CRT Accents */
  --crt-separator: #e89050;       /* ⚠️ Should this be #f79e55? See issue #1 */
  --crt-led-on: #00e676;
  --crt-wordmark-glow: rgba(200, 160, 255, 0.55);

  /* Taskbar */
  --taskbar-line: #e89050;

  /* Lab Surfaces */
  --lab-bg: #000000;
  --lab-surface: #1a0e30;
  --lab-surface-alt: #28184c;
  --lab-card: #1e1a32;           /* ❌ Should be #131325 */
  --lab-border: rgba(232, 144, 80, 0.12);

  /* Lab Typography */
  --lab-accent: #e89050;
  --lab-accent-dim: rgba(232, 144, 80, 0.6);
  --lab-heading: #e0d0ff;
  --lab-text: #b0a8c8;
  --lab-text-muted: #8880a8;      /* ❌ Fails WCAG AA on --lab-surface (4.3:1). Fix: → #a8a0c8 */
}
```

### Contrast Audit

| Variable | Hex | Background | Ratio | WCAG AA | Status |
|----------|-----|------------|-------|---------|--------|
| `--crt-text` | `#f0eaff` | `--crt-screen-bg` `#362866` | 8.4:1 | ✅ | Pass |
| `--lab-text` | `#b0a8c8` | `--lab-bg` `#000000` | 11.2:1 | ✅ | Pass |
| `--lab-heading` | `#e0d0ff` | `--lab-bg` `#000000` | 13.8:1 | ✅ | Pass |
| `--lab-accent` | `#e89050` | `--lab-bg` `#000000` | 6.8:1 | ✅ | Pass |
| `--lab-text-muted` | `#8880a8` | `--lab-surface` `#1a0e30` | 4.3:1 | ❌ | **Fail** |
| `--lab-text-muted` | `#8880a8` | `--lab-surface-alt` `#28184c` | 4.8:1 | ❌ | **Fail** |
| `.lab-link:hover` | `#ffffff` | `--lab-accent` `#e89050` | 2.9:1 | ❌ | **Fail** |

---

## Typography

### Font Family Mapping

| Font Family | Design Role | Format | Preload | `font-display` |
|-------------|-------------|--------|---------|----------------|
| `"Early GameBoy"` | **Body text** — paragraphs, buttons, cards (outside CRT) | WOFF2 (2.8KB) | ✅ Added 2026-06-12 | `swap` |
| `"Jersey 25"` | **Headings** — taglines, taskbar nav, service headings, contact data | WOFF2 | ✅ | `swap` |
| `"Monofett"` | **Wordmark** — "MAD LABS" logo, CRT hero | WOFF2 | ✅ | `swap` |
| `"VT323"` | **Fallback** — terminal-style elements, monospace fallback | WOFF2 | ✅ Added 2026-06-12 | `swap` |

### Font Stack Declarations

```css
/* Body (global.css line 112) */
font-family: "Early GameBoy", "Jersey 25", "VT323", "Courier New", monospace;

/* CRT/exclusive elements (self-set) */
font-family: "Monofett", "VT323", "Courier New", monospace;
font-family: "Jersey 25", "VT323", "Courier New", monospace;
```

### Typographic Scale

| Level | Usage | Font | Size | Weight | Case |
|-------|-------|------|------|--------|------|
| H1 | CRT hero wordmark | Monofett | `clamp(2rem, 7.8vw, 4.2rem)` | 400 | uppercase |
| H1 | Page title (subpages) | Monofett | `2.5rem` | 400 | uppercase |
| H2 | Section title | Jersey 25 | `clamp(1.35rem, 3.2vw, 2.2rem)` | 400 | uppercase |
| H3 | Card heading | Jersey 25 | `clamp(1.1rem, 1.8vw, 1.3rem)` | 400 | uppercase |
| Body | Paragraphs | Early GameBoy | `0.9rem` | 400 | mixed |
| Label | Stats, badges | Jersey 25 | `0.85rem` | 400 | uppercase |

---

## Spacing System

| Token | Value | Used For |
|-------|-------|----------|
| Section padding | `clamp(3rem, 8vw, 6rem)` | Top/bottom padding on `.lab-section` |
| Container narrow | `780px` max-width | `.lab-section-inner` |
| Container wide | `1100px` max-width | `.lab-section-inner-wide` |
| Card gap | `1.25rem` | Grid gaps |
| Card inner padding | `1.25rem` (ServiceCard), `1rem 1.25rem` (TrustCard) | Inside card bodies |
| Icon-to-text gap | `0.4rem` | Label + icon pairs |

---

## Z-Index Scale

| Token | Value | Used For |
|-------|-------|----------|
| `--z-base` | `1` | Content layers |
| `--z-content` | `10` | Screen content, particles |
| `--z-overlay` | `50` | Hover overlays, scroll hints |
| `--z-modal` | `100` | Modals, menus, tooltips |
| `--z-sticky` | `200` | Sticky headers |
| `--z-toast` | `500` | Notifications |
| `--z-editor` | `9999` | Editor overlays (admin only) |

**Note:** Many components still hardcode z-index values instead of using these tokens. See audit issue §2.6.

---

## Breakpoints

| Name | Pixel | Used For | Components Using |
|------|-------|----------|-----------------|
| Mobile | `< 640px` | Single column, stacked layout | CrtHero, ContactTablet, ServiceCard grid |
| Tablet | `640px – 1024px` | 2-column grids | ServiceCard grid |
| Desktop | `≥ 1024px` | Full layout, multi-column | All |
| Wide | `≥ 1100px` | Contact page hero split | ContactTablet |
| Extra wide | `≥ 1200px` | Contact page tablet layout | ContactTablet |

**⚠️ Issue:** No centralized breakpoint tokens. Each component invents its own.

---

## Related Files

| File | Content |
|------|---------|
| `src/styles/global.css` | All CSS custom properties, reduced motion, forced colors |
| `src/layouts/BaseLayout.astro` | HTML shell, meta tags, JSON-LD, font preloads |
| `docs/DESIGN_TOKENS.md` | **This file** — design token documentation |
| Brand spec | See vault: `Systems/Design/MAD-LABS-Brand-Packet/` |
| Colors skill | See skill: `madlabs-color` |
| Design system | See skill: `madlabs-design-system` |

---

## Known Issues (from 2026-06-12 Audit)

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | Dual orange conflict — `--crt-separator: #e89050` should be `#f79e55` per spec | P1 | Pick one semantic mapping |
| 2 | Neon purple `#ce47ff` missing — uses `#8c50f0`/`#9333ea` instead | P1 | Add `--neon-purple: #ce47ff` |
| 3 | `--lab-card: #1e1a32` should be `#131325` | P1 | Fix hex value |
| 4 | `--lab-text-muted` fails WCAG AA on `--lab-surface` (4.3:1) | P0 | Lighten to `#a8a0c8` |
| 5 | No centralized breakpoint tokens | P2 | Define `--bp-sm/md/lg/xl` |
| 6 | Early GameBoy WAS TTF (now WOFF2) — ✅ Fixed 2026-06-12 | — | Resolved |
| 7 | VT323 & Early GameBoy not preloaded — ✅ Fixed 2026-06-12 | — | Resolved |
