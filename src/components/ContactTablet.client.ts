// ContactTablet.client.ts
// Direct-show Zoho booking for the contact page.
//
// The Zoho Bookings free plan = one booking type. The contact tablet shows
// the calendar directly (no menu state, no button click). The MAD LABS oval
// nameplate covers the iframe area while Zoho loads; when it finishes, the
// nameplate slides up with a CRT scan line tracer and Zoho's calendar appears.
//
// Lazy-loading: src is set on first-of (IntersectionObserver triggers when
// the tablet is within 300px of viewport) OR after a 3-second fallback
// timer. This prevents a 30-second blank iframe on initial page load.

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
  var statusLine = document.getElementById("booking-status-line");
  var statusText = document.getElementById("booking-status-text");
  var placeholder = document.getElementById("booking-placeholder");
  if (!iframe || !nameplate || !statusLine || !statusText || !placeholder) return;

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ─── State ───
  var iframeLoaded = false;
  var iframeSrcSet = false;
  var fallbackTimer = null;
  var statusTextTimer = null;
  var slowLoadTimer = null;
  var twelveSecondTimer = null;

  /**
   * Start loading the Zoho iframe. Idempotent — safe to call multiple times.
   *
   * - Adds the loading class to the nameplate (triggers scan line tracer)
   * - Shows the status line
   * - Sets the iframe src (triggers Zoho load)
   * - Starts the 12-second timeout (catches the failure case)
   */
  function startZohoLoad() {
    if (iframeSrcSet) return;
    iframeSrcSet = true;

    // Cancel the 3-second fallback timer if it was still running
    if (fallbackTimer !== null) {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }

    // Mark the nameplate as loading (scan line tracer appears)
    if (!prefersReducedMotion) {
      nameplate.classList.add("is-loading");
    }

    // Show the status line
    statusLine.hidden = false;
    statusText.textContent = "TUNING BOOKING SIGNAL…";

    // After 6 seconds without loading, change the status to a
    // "still working" message (reassures the user that things are happening).
    slowLoadTimer = window.setTimeout(function () {
      if (!iframeLoaded) {
        statusText.textContent = "STILL TUNING… ALMOST THERE";
      }
    }, 6000);

    // Set the iframe src. The sandbox attribute on the iframe element
    // already includes allow-same-origin, which Zoho requires for its
    // portal-embed to make cross-origin API calls.
    iframe.setAttribute("src", config.bookingUrl);

    // 12-second timeout: if iframe still hasn't loaded by now, show
    // the network gremlin error panel.
    twelveSecondTimer = window.setTimeout(function () {
      if (!iframeLoaded) {
        showError();
      }
    }, 12000);
  }

  /**
   * Called when the Zoho iframe finishes loading. Slides the nameplate up
   * and reveals the calendar.
   */
  function onIframeLoaded() {
    iframeLoaded = true;
    iframe.dataset.loaded = "true";
    window.clearTimeout(twelveSecondTimer);
    window.clearTimeout(slowLoadTimer);
    if (statusTextTimer !== null) {
      window.clearTimeout(statusTextTimer);
    }

    // Update status to "ready" then fade out
    statusText.textContent = "READY";
    statusTextTimer = window.setTimeout(function () {
      statusLine.hidden = true;
    }, 500);

    // Slide the nameplate up and out. With reduced motion, just hide it.
    if (prefersReducedMotion) {
      nameplate.style.display = "none";
    } else {
      nameplate.classList.remove("is-loading");
      nameplate.classList.add("is-loaded");
    }

    // Make sure the error panel is hidden
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

    // Track the success
    try {
      document.dispatchEvent(
        new CustomEvent("madlabs:analytics", {
          detail: { event: "contact_booking_iframe_loaded" },
        })
      );
    } catch {}
  }

  /**
   * Called when Zoho fails (onerror or 12s timeout). Shows the network
   * gremlin error panel.
   */
  function showError() {
    window.clearTimeout(slowLoadTimer);

    // Hide the nameplate so the error panel is visible
    if (prefersReducedMotion) {
      nameplate.style.display = "none";
    } else {
      nameplate.classList.remove("is-loading");
      nameplate.classList.add("is-error");
    }

    // Hide the iframe and the status line
    iframe.hidden = true;
    iframe.setAttribute("src", "");
    statusLine.hidden = true;

    // Show the error panel
    placeholder.hidden = false;

    // Track the error
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
    window.clearTimeout(twelveSecondTimer);
    window.clearTimeout(slowLoadTimer);
    showError();
  });

  // ─── Trigger Zoho load on first-of ───

  // 1. 3-second fallback timer (covers users who don't scroll)
  fallbackTimer = window.setTimeout(function () {
    startZohoLoad();
  }, 3000);

  // 2. IntersectionObserver: trigger when the tablet is near the viewport.
  //    If the user scrolls within 300px of the tablet, start loading.
  if (typeof IntersectionObserver !== "undefined") {
    var observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            startZohoLoad();
            observer.disconnect();
            break;
          }
        }
      },
      {
        // 300px root margin = "fire when tablet is 300px below the bottom
        // of the viewport" (catches scroll-toward case before user sees tablet)
        rootMargin: "0px 0px 300px 0px",
        threshold: 0,
      }
    );
    // Observe the tablet root (the .contact-tablet element)
    var root = document.querySelector("[data-tablet-root]");
    if (root) observer.observe(root);
  }
})();
