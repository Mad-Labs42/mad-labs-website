// @ts-nocheck
// ContactTablet.client.ts
// Nimbuspop inline Zoho booking for the contact page.
//
// The Zoho Bookings free plan = one booking type. Nimbuspop's inline embed
// (https://bookings.nimbuspop.com/assets/embed.js) wraps Zoho and renders
// the booking widget INSIDE a div on our page (no iframe, no X-Frame-Options
// issue). The widget appears in <div id="inline-container">.
//
// TIMING: The nameplate + beaker-pattern wallpaper stay for AT LEAST 6
// seconds so the user never sees Zoho's plain "Mad Labs..." loading state.
// After 6 seconds, OR when Nimbuspop signals the widget is ready
// (whichever is later), the nameplate slides up + the beaker pattern +
// CRT atmosphere effects fade out TOGETHER. The user only sees our branded
// loading state, then the form.
//
// LOADER: We dynamically inject the Nimbuspop <script> tag on page load.
// It calls window.Bookings.inlineEmbed() once it has the embed library
// ready. The widget renders in the inline container. We poll for the
// iframe that Nimbuspop creates to detect "ready" state.

(function () {
  "use strict";

  var cfgEl = document.getElementById("tablet-config");
  if (!cfgEl) return;
  var config;
  try { config = JSON.parse(cfgEl.textContent || "{}"); } catch { return; }
  if (!config.zohoUrl || !config.nimbuspopScriptSrc) return;

  // ─── Element refs ───
  var nameplate = document.getElementById("booking-nameplate");
  var placeholder = document.getElementById("booking-placeholder");
  var container = document.getElementById("inline-container");
  if (!nameplate || !placeholder || !container) return;

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ─── Timing constants ───
  // The nameplate is the loading screen. It must look intentional.
  // The user explicitly wants the beaker pattern + nameplate to stay for
  // 5-7 seconds to cover Zoho's plain "Mad Labs..." loading state.
  // We use 6 seconds as a middle ground.
  var MIN_VISIBLE_MS = 6000;

  // If the widget hasn't rendered by this point, show the network
  // gremlin error panel.
  var FAILURE_TIMEOUT_MS = 20000;

  // ─── State ───
  var widgetReady = false;
  var minVisibleTimerExpired = false;
  var failureTimer = null;
  var pollTimer = null;
  var startedAt = 0;

  /**
   * Called when the minimum-visible timer (6s) has expired. This is the
   * ONLY thing that fades the beaker pattern + atmosphere effects.
   * The widget being ready is NOT what fades the screen — that's the
   * nameplate's job. This way the beaker pattern stays visible alongside
   * the nameplate for the full 6 seconds, even if the widget has been
   * rendered into the inline container for a while.
   */
  function onMinVisibleExpired() {
    minVisibleTimerExpired = true;
    // Flip the screen's data-tablet-state so the atmosphere layers
    // (beaker pattern, scanlines, glow, etc.) fade out together with the
    // nameplate. The user sees the beaker background + nameplate as a
    // unified loading state that disappears together.
    var screen = document.querySelector("[data-tablet-screen]");
    if (screen) {
      screen.setAttribute("data-tablet-state", "loaded");
    }
    // Now check if the widget is also ready — if so, reveal the nameplate.
    tryRevealNameplate();
  }

  /**
   * Slide the nameplate up + CRT scan line tracer. Called when BOTH:
   *   1. The Nimbuspop widget has rendered (or failed), AND
   *   2. The minimum-visible timer has expired (6 seconds).
   *
   * If the minimum-visible timer hasn't expired when the widget renders,
   * we wait for the timer. This guarantees the nameplate looks intentional.
   */
  function tryRevealNameplate() {
    if (!widgetReady) return;  // Widget hasn't rendered yet
    if (!minVisibleTimerExpired) return;  // Still in minimum-visible window
    revealNameplate();
  }

  function revealNameplate() {
    if (prefersReducedMotion) {
      nameplate.style.display = "none";
    } else {
      nameplate.classList.remove("is-loading");
      nameplate.classList.add("is-loaded");
    }
    placeholder.hidden = true;

    // Show the scroll hint briefly so the user knows they can scroll
    // within the inline widget
    var hint = document.getElementById("booking-scroll-hint");
    if (hint) {
      hint.classList.remove("hint-hidden");
      hint.classList.add("hint-visible");
      window.setTimeout(function () {
        hint.classList.remove("hint-visible");
        hint.classList.add("hint-hidden");
      }, 5000);
    }

    // Stop polling for widget readiness
    if (pollTimer !== null) {
      window.clearInterval(pollTimer);
      pollTimer = null;
    }

    // Fire analytics
    try {
      document.dispatchEvent(
        new CustomEvent("madlabs:analytics", {
          detail: { event: "contact_booking_widget_loaded" },
        })
      );
    } catch {}
  }

  /**
   * Called when the Nimbuspop widget has rendered. Triggers the reveal
   * IF the minimum-visible timer has expired. Otherwise waits for it.
   *
   * We detect "rendered" by polling for an iframe inside the container
   * (Nimbuspop injects an iframe into the inline-container).
   */
  function onWidgetReady() {
    widgetReady = true;
    if (failureTimer !== null) {
      window.clearTimeout(failureTimer);
      failureTimer = null;
    }
    tryRevealNameplate();
  }

  /**
   * Called when the widget fails to render (after FAILURE_TIMEOUT_MS).
   * Shows the network gremlin error panel.
   */
  function showError() {
    if (prefersReducedMotion) {
      nameplate.style.display = "none";
    } else {
      nameplate.classList.remove("is-loading");
      nameplate.classList.add("is-error");
    }
    if (pollTimer !== null) {
      window.clearInterval(pollTimer);
      pollTimer = null;
    }
    placeholder.hidden = false;
    try {
      document.dispatchEvent(
        new CustomEvent("madlabs:analytics", {
          detail: { event: "contact_booking_widget_error" },
        })
      );
    } catch {}
  }

  /**
   * Poll the inline container for the Nimbuspop iframe. Once we see an
   * iframe with non-zero dimensions, the widget is ready.
   */
  function pollForWidget() {
    var iframe = container.querySelector("iframe");
    if (iframe) {
      // Wait for the iframe to have a non-zero size
      var rect = iframe.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        // Give it another 500ms to ensure the content is fully painted
        window.setTimeout(onWidgetReady, 500);
        return;
      }
    }
    // Also check for direct DOM injection (some Nimbuspop versions do this)
    if (container.children.length > 0 && !container.querySelector("script")) {
      // The container has content that isn't a script
      window.setTimeout(onWidgetReady, 500);
      return;
    }
    // Keep polling
    pollTimer = window.setTimeout(pollForWidget, 250);
  }

  // ─── Start the loading flow on page load ───
  startedAt = Date.now();

  // Mark the nameplate as loading (triggers scan line tracer)
  if (!prefersReducedMotion) {
    nameplate.classList.add("is-loading");
  }

  // ─── Load the Nimbuspop script dynamically ───
  // The script reads window.Bookings.inlineEmbed() and renders the
  // widget in our container. We initialize AFTER the script loads.
  var npScript = document.createElement("script");
  npScript.src = config.nimbuspopScriptSrc;
  npScript.async = true;
  npScript.onload = function () {
    // Nimbuspop's Bookings object should be available now
    if (window.Bookings && typeof window.Bookings.inlineEmbed === "function") {
      try {
        window.Bookings.inlineEmbed({
          url: config.zohoUrl,
          parent: "#inline-container",
          height: "600px",
        });
      } catch (e) {
        // If inlineEmbed throws, the poll will eventually time out
      }
    }
    // Start polling for the widget to render
    pollForWidget();
  };
  npScript.onerror = function () {
    // Nimbuspop script failed to load — show error after the timer
    if (failureTimer !== null) {
      window.clearTimeout(failureTimer);
    }
    if (minVisibleTimerExpired) {
      showError();
    } else {
      window.setTimeout(
        showError,
        Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt))
      );
    }
  };
  document.head.appendChild(npScript);

  // ─── Minimum-visible timer: nameplate + beaker pattern must stay
  // for at least 6 seconds. After this, flip the screen state (fades
  // out the beaker + atmosphere effects) and check if the widget is
  // ready — if so, reveal the nameplate. ───
  window.setTimeout(onMinVisibleExpired, MIN_VISIBLE_MS);

  // ─── Failure timer: if the widget hasn't rendered by now, show error.
  // The nameplate stays on screen until min-visible is also up. ───
  failureTimer = window.setTimeout(function () {
    if (!widgetReady) {
      if (minVisibleTimerExpired) {
        showError();
      } else {
        window.setTimeout(
          showError,
          Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt))
        );
      }
    }
  }, FAILURE_TIMEOUT_MS);
})();
