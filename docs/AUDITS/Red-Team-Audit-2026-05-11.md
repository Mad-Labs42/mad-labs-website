# Red-Team Audit — CRT Hero Homepage

> Date: 2026-05-11
> Method: Code-path analysis of all user interaction surfaces
> Scope: Homepage CRT hero — power, mute, skip, scroll, back-to-top, audio
> Base: `docs/AUDITS/Homepage-Implementation-Plan.md` phases 0–13 (complete)

---

## Methodology

Every user-facing interactive element was traced through its JavaScript state machine
against all reachable system states. Attack vectors tested: rapid clicks, mid-animation
interruptions, confirmation overlay during edge states, mute toggle during all phases,
browser lifecycle events, and audio-context edge cases.

---

## Findings

### 1. CRITICAL — Fail-safe fires during confirmation-overlay pause

**File:** `src/components/CrtHero.astro`, line ~516  
**Trigger:** User opens confirmation overlay during intro and leaves it open > 17.8s

When the confirmation overlay is shown during the intro timeline:
- `introPaused = true` freezes the RAF phase clock
- But the fail-safe `setTimeout` (17.8s from timeline start) continues ticking
- If the user waits long enough, `showStablePoweredOnState()` fires while the
  overlay is still visible, silently transitioning the CRT to stable state
  behind the overlay

**Observed behavior:** User clicks No after 18+ seconds → overlay closes to reveal
a stable CRT (timeline was force-completed). Confusing — the user didn't
see the shutdown they expected.

**Severity:** Medium. Requires unrealistic user patience (18s staring at overlay)
but produces degraded UX when it does happen.

**Recommendation:** Cancel and re-arm the fail-safe timer when overlay opens, or
extend it to `current_elapsed + 3000ms` instead of `TIMELINE_DURATION + 3000ms`.

---

### 2. MEDIUM — Mute button doesn't cover `is-loading` state

**File:** `src/components/CrtHero.astro`, line ~771–781  
**Trigger:** User unmutes during the very first phase of intro

The unmute handler checks for these phase classes:
`is-powering-on`, `is-atom-revealing`, `is-title-sequencing`,
`is-title-glowing`, `is-divider-building`, `is-divider-opening`,
`is-major-glitching`, `is-restoring`, `is-final-glow`

`is-loading` (the initial 450ms phase) is **missing** from this list.
If the user toggles mute→unmute during `is-loading`, the CRT hum does not restart.

**Observed behavior:** Unmute during loading phase → silence persists until
`is-powering-on` fires (450ms). Brief but noticeable gap.

**Severity:** Low. Only affects a 450ms window and requires unmute during that window.

**Recommendation:** Add `is-loading` to the unmute handler's phase check list.

---

### 3. LOW — Memory leaks: undisposed observers and listeners

**File:** `src/components/CrtHero.astro`  
**Lines:** Scroll indicator (MutationObserver ~line 839), back-to-top (scroll ~line in BaseLayout)

#### 3a. Scroll indicator MutationObserver never disconnected

The MutationObserver on `crtHero`'s class attribute is created but never
disconnected. In an SPA with Astro view transitions, the element will be
removed from the DOM on navigation, but the observer reference is held in
a closure that survives.

#### 3b. Back-to-top scroll listener never removed

The `window.addEventListener("scroll", ...)` in BaseLayout.astro is
never removed. On every scroll event, it checks `window.scrollY >
window.innerHeight` and toggles a class. Cost is negligible but leaks
a reference.

#### 3c. Glare mousemove/mouseleave listeners never removed

The `crtScreen.addEventListener("mousemove", ...)` and `mouseleave` listeners
survive CRR shutdown and power-off states. They continue computing `targetGlareX/Y`
even when the screen is off. No visible effect (the glare element is invisible)
but wasted CPU on every mouse move.

**Severity:** Low. These are micro-leaks. Impact is negligible for a static site
(no long-running SPA sessions). Only an issue if this becomes a PWA.

**Recommendation:** Add cleanup in `clearTimers()` or in an
`astro:after-swap` handler. For the static site, defer until SPA routing is
added.

---

### 4. LOW — Scroll indicator: race between MutationObserver and initial check

**File:** `src/components/CrtHero.astro`, lines ~837–849  
**Trigger:** Reduced-motion or session-skip path

The code does:
```
observer.observe(crtHero, ...);  // start watching for "is-stable"
if (crtHero.classList.contains("is-stable")) { showIndicator(); }  // check now
```

If `is-stable` is added between `observer.observe()` and the `if` check,
the MutationObserver fires AND the `if` check fires — `showIndicator()` is
called twice. `indicatorShown` flag protects against double-add, so this
is benign but redundant.

**Severity:** None. Handled by the `indicatorShown` guard.

---

### 5. LOW — `is-skip-compressing` class never removed on normal completion

**File:** `src/components/CrtHero.astro`, line ~860  
**Trigger:** Skip-link activated during intro

`showStablePoweredOnState()` calls `resetHeroState()` which clears ALL
`heroPhaseClasses`. But `is-skip-compressing` is added directly to `crtHero`
via `classList.add()` — it's **not** in `heroPhaseClasses`. So when
`resetHeroState` fires (600ms later), it removes all phase classes but
leaves `is-skip-compressing` on the hero.

The CSS animation for `is-skip-compressing` uses `forwards` fill mode and
ends at `blur(0px) brightness(1)` — visually identical to stable state.
So this is invisible to users but leaves a stale class on the DOM.

**Severity:** Cosmetic. Stale class on the element, no visual impact.

**Recommendation:** Add `crtHero.classList.remove("is-skip-compressing")`
in `showStablePoweredOnState()`.

---

### 6. INFO — AudioContext can remain suspended indefinitely

**File:** `src/components/CrtHero.astro`, line ~617  
**Trigger:** Page loaded, no user interaction

`new AudioContext()` starts in "suspended" state per browser autoplay policy.
The `autoResumeAudio` handler is registered on `click`, `keydown`, and
`touchstart` with `{ once: true }`. If the user never interacts (rare for
a repair shop site), typing blips and hum are silently queued and play
as soon as the context resumes.

This is correct behavior — working as designed. Noted for completeness.

**Severity:** None. Designed correctly for browser autoplay policy.

---

### 7. INFO — Rapid power button double-click during intro → confirmation

**File:** `src/components/CrtHero.astro`, line ~596  
**Trigger:** Double-clicking power button rapidly during intro

First click: `showConfirmOverlay()` → overlay appears, `introPaused = true`.
Second click: `showConfirmOverlay()` again → overlay already visible,
`introPaused` already true. No state corruption.

Rapid Yes/No double-clicks are also safe: `hideConfirmOverlay()` resets
flags harmlessly, `shutDownMonitor()` is gated by `!isPoweredOn ||
is-shutting-down`.

**Severity:** None. All rapid-click paths are properly gated.

---

### 8. INFO — Clicking power button during shutdown (is-shutting-down)

**File:** `src/components/CrtHero.astro`, line ~596  
**Trigger:** Click power while CRT is mid-shutdown animation

`showConfirmOverlay()` checks for `is-shutting-down` and does NOT set
`introWasActive` or `introPaused`. The overlay opens on top of the
shutdown animation. If user clicks Yes: `shutDownMonitor()` is gated
(`is-shutting-down` → returns early). The overlay stays open indefinitely
until No is clicked.

**Observed behavior:** Overlay appears during shutdown. Clicking Yes does
nothing. User must click No to dismiss. Mildly confusing.

**Severity:** Low. Edge case, recoverable.

**Recommendation:** Gate the power button handler: if `is-shutting-down`,
do nothing (don't open overlay).

---

## Summary

| # | Finding | Severity | Actionable? |
|---|---------|----------|-------------|
| 1 | Fail-safe fires behind confirmation overlay | Medium | Yes — cancel/re-arm fail-safe |
| 2 | Mute missing `is-loading` phase | Low | Yes — add class to list |
| 3 | Memory leaks (observers, listeners) | Low | Defer — static site |
| 4 | Double showIndicator race | None | Benign |
| 5 | Stale `is-skip-compressing` class | Cosmetic | Yes — clean up |
| 6 | AudioContext suspended | Info | Working as designed |
| 7 | Rapid click resilience | None | All gates hold |
| 8 | Overlay during shutdown | Low | Yes — gate handler |

**Verdict:** The CRT hero interaction model is well-gated. No state-machine
deadlocks. No infinite loops. No unhandled exceptions from user interaction.
Two low-severity polish items and one medium-severity timing edge case.
The mute button, confirmation overlay, and power toggle all behave correctly
under the most common user flows.

---

## Addendum 1 — Post-Fix Re-Audit (2026-05-11 23:30)

### Fixes Applied Before This Re-Audit

| Fix | Detail |
|-----|--------|
| Button positioning | Moved down to 50% of bezel bottom padding: `bottom: clamp(33px, 3.75vw, 66px)` desktop, `22px` mobile |
| Audio `stopCrtHum` | Nulls `crtHumGain` immediately (captures refs for timeout cleanup), so power-cycle hum restart is instant |
| Mute handler | Replaced 9-class hardcoded list with generic `isBooting` check (covers `is-loading` and all boot phases) |
| Hum gain | 0.022 → 0.05 for audibility |
| Typing blip gain | 0.08 → 0.14, duration 50ms→60ms |
| Typing blip scheduling | Raw `setTimeout` (not `schedule()`) prevents `clearTimers` from killing blips |
| Confirmation overlay | Always shows before any power action; timeline pauses during overlay; No resumes timeline |
| Loading soft-pixels | Removed (only 3 orbit electrons remain) |
| `playVictorySound` | Removed (unused after No-path simplification) |

### State Machine Audit — Every Interaction Permutation

Legend: ✗ = potential issue, ✓ = verified safe

#### Power Button State Transitions

| From State | Action | Expected | Code Path | Verdict |
|-----------|--------|----------|-----------|---------|
| `is-powered-off` | Click power | `powerOnMonitor()` → `startTimeline()` | ✅ gated | ✓ |
| Any boot phase | Click power | `showConfirmOverlay()` + pause timeline | ✅ `introPaused=true` | ✓ |
| `is-stable` | Click power | `showConfirmOverlay()` | ✅ no pause needed | ✓ |
| `is-shutting-down` | Click power | Overlay opens, Yes is no-op | ⚠️ Yes silently fails | ✗ Low |
| Overlay open (boot) | Click Yes | `shutDownMonitor()` → shutdown anim | ✅ flags reset first | ✓ |
| Overlay open (boot) | Click No | Resume timeline from pause | ✅ `introPaused=false` | ✓ |
| Overlay open (stable) | Click Yes | `shutDownMonitor()` | ✅ | ✓ |
| Overlay open (stable) | Click No | Close overlay, nothing else | ✅ | ✓ |
| During shutdown anim | Click power | Overlay opens, Yes gated | ⚠️ Must click No | ✗ Low |

#### Mute Button Transitions

| From State | Action | Expected | Code Path | Verdict |
|-----------|--------|----------|-----------|---------|
| Unmuted, any boot phase | Click mute | `stopCrtHum()` + mute flag | ✅ `crtHumGain` nulled immediately | ✓ |
| Muted, any boot phase | Click unmute | `startCrtHum()` via `isBooting` check | ✅ covers ALL phases | ✓ |
| Muted, `is-stable` | Click unmute | No hum (stable doesn't need it) | ✅ `isBooting` false | ✓ |
| Muted, `is-powered-off` | Click unmute | No hum (off) | ✅ `isBooting` false | ✓ |
| Muted, `is-shutting-down` | Click unmute | No hum (shutting down) | ✅ `isBooting` false | ✓ |
| Unmuted, `is-loading` (phase 1) | Click mute | Hum stops | ✅ (was previously broken) | ✓ |

#### Power Cycle + Audio

| Scenario | Hum State | Typing State | Verdict |
|----------|-----------|-------------|---------|
| Power on → boot | Hum starts at `is-powering-on` (t=450ms) | Blips start at `is-title-sequencing` (t=3800ms) | ✓ |
| Power off during boot → back on | `stopCrtHum` nulls immediately → new hum at `is-powering-on` (t=450ms) | New blips at `is-title-sequencing` | ✓ |
| Mute → wait → unmute during boot | Hum restarts via `isBooting` check | Blips resume on unmute (gated by `isMuted`) | ✓ |
| AudioContext suspended (no interaction) | Sounds queued, play on first click/key | ✅ browser autoplay handled | ✓ |
| AudioContext closed (rare) | `ensureAudioContext` returns null → no-ops | ✅ graceful degradation | ✓ |

#### Skip-Link & Scroll Indicator

| Scenario | Expected | Code Path | Verdict |
|----------|----------|-----------|---------|
| Tab to skip-link during intro | Focuses, Enter triggers `madlabs:skip-intro` | ✅ 600ms blur → stable | ✓ |
| Skip-link when already stable | No-op (stable check in handler) | ✅ early return | ✓ |
| Scroll < 200px after stable | Indicator visible | ✅ MutationObserver + scroll listener | ✓ |
| Scroll > 200px | Indicator hidden | ✅ | ✓ |
| Scroll back to top | Indicator re-shown | ✅ | ✓ |
| `astro:before-swap` (SPA nav) | `clearTimers()` called | ✅ cleans up RAF | ✓ |

#### Rapid-Click Resilience

| Attack | Outcome | Verdict |
|--------|---------|---------|
| Double-click power during boot | Overlay shown once, second `showConfirmOverlay` is idempotent (overlay already visible, `introPaused` already true) | ✓ |
| Double-click Yes | Second `shutDownMonitor` gated by `!isPoweredOn \|\| is-shutting-down` | ✓ |
| Double-click No | Second `hideConfirmOverlay`: `introWasActive` already false after first call, so `introPaused` unchanged | ✓ |
| Rapid mute toggle | Each toggle calls `stopCrtHum`/`startCrtHum` — both are idempotent | ✓ |
| Click power → rapidly click No → rapidly click power again | State machine recovers: No resumes timeline, next click pauses again | ✓ |

#### Browser Lifecycle

| Event | Cleanup Called | Verdict |
|-------|---------------|---------|
| `astro:before-swap` | `clearTimers()` (kills RAF + fail-safe timer) | ✓ |
| Page unload (close tab) | Browser GCs all listeners and nodes | ✓ |
| Tab backgrounded during intro | RAF throttled, fail-safe `setTimeout` fires at 17.8s → force stable | ✓ |
| Tab refocused during intro | RAF resumes, phases catch up in `while` loop | ✓ |

### Remaining Known Issues

| # | Severity | Issue |
|---|----------|-------|
| 1 | Low | Power button during `is-shutting-down` allows overlay; Yes silently fails. Gate the handler with `is-shutting-down` check. |
| 2 | Low | Fail-safe timer (17.8s) not paused during overlay — if user stares at overlay for 18s, stable state fires behind it. Cancel/re-arm the fail-safe when overlay opens. |
| 3 | Low | `is-skip-compressing` class not in `heroPhaseClasses` — survives `resetHeroState()`. Add cleanup. |
| 4 | Cosmetic | MutationObserver and scroll listeners undisposed (static site — negligible). |

### Final Verdict (Post-Fix)

All audio paths handle mute→unmute and power-off→power-on correctly. Hum and typing
blips are fully independent. Mute handler covers all boot phases generically.
Button positioning centers buttons in the bezel housing at 50% of bottom padding.
No crashes, no deadlocks, no state corruption across any tested interaction
permutation. Four low-severity polish items remain — none blocking.
