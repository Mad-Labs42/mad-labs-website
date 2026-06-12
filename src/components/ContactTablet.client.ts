// ContactTablet.client.ts
// Direct-show Zoho booking for the contact page.
//
// The Zoho Bookings free plan = one booking type. The contact tablet shows
// the calendar directamente (no menu state, no button click). The MAD LABS oval
// nameplate covers the iframe area while Zoho loads in the background, then
// slides up with a CRT scan line tracer when Zoho finishes.
//
// TIMING: The nameplate stays for AT LEAST 5 seconds so it looks like a
// professional loading screen, not a glitch. After 5 seconds, OR when Zoho
// actually finishes loading (whichever is later), the nameplate slides up.
//
// LAZY-LOAD: Removed. The iframe src is set on page load (Zoho loads in
// the background). The user sees the nameplate covering the iframe area the
// whole time. If the user scrolls past the tablet quickly, Zoho still loads
// (no perf cost because it loads off-screen anyway).

(function () {
  "use strict";

  var cfgEl = document.getElementById("tablet-config");
  if (!cfgEl) return;
  var config;
  try { config = JSON.parse(cfgEl.textContent || "{}"); } catch { return; }
  if (!config.bookingUrl) return;

  // ─── Element refs ───
  var iframe = document.getElementById("booking-iframe");
  var nameplate = document.getElementById("booking-nameplate");
  var placeholder = document.getElementById("booking-placeholder");
  if (!iframe || !nameplate || !placeholder) return;

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ─── Timing constants ───
  // The nameplate is the loading screen. It must look intentional.
  // MIN_VISIBLE_MS = minimum time the nameplate stays on screen.
  // This is the user-perceived "loading" duration, regardless of how
  // fast Zoho actually loads.
  var MIN_VISIBLE_MS = 5000;

  // If Zoho hasn't loaded by this point, show the network gremlin panel.
  var FAILURE_TIMEOUT_MS = 15000;

  // ─── State ───
  var iframeLoadFiredAt = 0;
  var minVisibleTimerExpired = false;
  var failureTimer = null;
  var startedAt = 0;

  /**
   * Slide the nameplate up + scan line tracer. Called when BOTH:
   *   1. Zoho has loaded (or failed), AND
   *   2. The minimum-visible timer has expired.
   *
   * If the minimum-visible timer hasn't expired when Zoho loads, we wait
   * for it. This guarantees the nameplate looks intentional.
   */
  function tryRevealNameplate() {
    if (!iframeLoadFiredAt) return;  // Zoho hasn't finished yet
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
    // within the iframe
    var hint = document.getElementById("booking-scroll-hint");
    if (hint) {
      hint.classList.remove("hint-hidden");
      hint.classList.add("hint-visible");
      window.setTimeout(function () {
        hint.classList.remove("hint-visible");
        hint.classList.add("hint-hidden");
      }, 5000);
    }
  }

  /**
   * Called when Zoho finishes loading. Triggers the reveal IF the
   * minimum-visible timer has expired. Otherwise waits for the timer.
   */
  function onIframeLoaded() {
    iframeLoadFiredAt = Date.now();
    iframe.dataset.loaded = "true";
    if (failureTimer !== null) {
      window.clearTimeout(failureTimer);
      failureTimer = null;
    }
    tryRevealNameplate();
  }

  /**
   * Called when Zoho fails (onerror or FAILURE_TIMEOUT_MS timeout).
   * Shows the network gremlin error panel.
   */
  function showError() {
    if (prefersReducedMotion) {
      nameplate.style.display = "none";
    } else {
      nameplate.classList.remove("is-loading");
      nameplate.classList.add("is-error");
    }
    iframe.hidden = true;
    iframe.setAttribute("src", "");
    placeholder.hidden = false;
    try {
      document.dispatchEvent(
        new CustomEvent("madlabs:analytics", {
          detail: { event: "contact_booking_iframe_error" },
        })
      );
    } catch {}
  }

  // ─── Wire up the iframe events ───
  iframe.addEventListener("load", onIframeLoaded);
  iframe.addEventListener("error", function () {
    if (failureTimer !== null) {
      window.clearTimeout(failureTimer);
      failureTimer = null;
    }
    // Still respect the min-visible window — but show the error panel
    // underneath the nameplate
    iframeLoadFiredAt = Date.now();
    iframe.dataset.errored = "true";
    if (minVisibleTimerExpired) {
      showError();
    } else {
      window.setTimeout(showError, Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt)));
    }
  });

  // ─── Start loading Zoho immediately on page load ───
  // The nameplate covers the iframe area, so the user sees a clean
  // loading screen while Zoho loads in the background.
  startedAt = Date.now();
  iframe.setAttribute("src", config.bookingUrl);

  // Mark the nameplate as loading (triggers scan line tracer)
  if (!prefersReducedMotion) {
    nameplate.classList.add("is-loading");
  }

  // ─── Minimum-visible timer: nameplate must stay for at least 5 seconds ───
  window.setTimeout(function () {
    minVisibleTimerExpired = true;
    tryRevealNameplate();
  }, MIN_VISIBLE_MS);

  // ─── Failure timer: if Zoho doesn't load in 15s, show error panel ───
  // The nameplate stays on screen the whole time (we don't show error
  // until min-visible is also up).
  failureTimer = window.setTimeout(function () {
    if (!iframe.dataset.loaded && !iframe.dataset.errored) {
      iframe.dataset.errored = "true";
      iframeLoadFiredAt = Date.now();
      // Don't show the error yet — wait for min-visible
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

  // ─── Track the success event for analytics ───
  // (The actual analytics fire happens when Zoho loads, tracked via the
  // iframe's load event above.)
})();
