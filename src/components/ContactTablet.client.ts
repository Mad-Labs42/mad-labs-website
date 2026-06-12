// @ts-nocheck
// ContactTablet.client.ts
// State management for the CRT intake tablet — menu/booking states,
// event handling, iframe management, and scroll hint timing.
// Config injected via #tablet-config JSON script tag (set:html from Astro frontmatter).

(function () {
  "use strict";

  var cfgEl = document.getElementById("tablet-config");
  if (!cfgEl) return;
  var config;
  try { config = JSON.parse(cfgEl.textContent || "{}"); } catch { return; }
  if (!config.triageUrl && !config.consultUrl && !config.fallbackUrl) return;

  var root = document.querySelector("[data-tablet-root]");
  if (!root) return;
  var screen = root.querySelector("[data-tablet-screen]");
  if (!screen) return;

  var states = {
    menu: screen.querySelector('[data-tablet-state="menu"]'),
    booking: screen.querySelector('[data-tablet-state="booking"]'),
  };

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function trackEvent(name) {
    try {
      document.dispatchEvent(new CustomEvent("madlabs:analytics", { detail: { event: name } }));
    } catch { /* never throw */ }
    try { if (typeof clarity !== "undefined") clarity("event", name); } catch { /* never throw */ }
    try { if (typeof gtag === "function") gtag("event", name); } catch { /* never throw */ }
    if (import.meta.env.DEV) {
      console.log("[Analytics]", name);
    }
  }

  function focusBackButton(target) {
    var stateEl = states[target];
    if (stateEl) {
      var backBtn = stateEl.querySelector(".tablet-back-btn");
      if (backBtn && !prefersReducedMotion) {
        window.setTimeout(function () { backBtn.focus(); }, 50);
      }
    }
  }

  function switchState(target) {
    Object.keys(states).forEach(function (key) {
      var el = states[key];
      if (el) el.hidden = true;
    });
    var targetEl = states[target];
    if (targetEl) targetEl.hidden = false;
    if (target === "booking") {
      focusBackButton("booking");
      var hint = document.getElementById("booking-scroll-hint");
      if (hint) {
        hint.classList.remove("hint-hidden");
        hint.classList.add("hint-visible");
        window.setTimeout(function () {
          hint.classList.remove("hint-visible");
          hint.classList.add("hint-hidden");
        }, 5000);
      }
    } else if (target === "menu") {
      trackEvent("contact_back_to_menu");
    }
  }

  function resolveBookingUrl(serviceType) {
    var specific = serviceType === "triage" ? config.triageUrl : config.consultUrl;
    var serviceId = serviceType === "triage" ? config.triageServiceId : config.consultServiceId;
    if (specific) {
      return serviceId ? specific + "#/" + serviceId : specific + "#/madlabs";
    }
    if (config.fallbackUrl) return config.fallbackUrl + "#/madlabs";
    return "";
  }

  function showBookingLoading() {
    // Subtle loading indicator — just a status line at the bottom.
    // Does NOT replace the iframe area (that would cause a "flash" when the
    // iframe loads quickly). The user sees the Zoho widget render into
    // the same area; only the status line tells them something is happening.
    var status = document.getElementById("booking-loading-status");
    if (!status) return;
    status.hidden = false;
  }

  function showBookingError(message) {
    // Only called when Zoho actually fails (12s timeout, or onerror).
    // At this point the iframe has been hidden — we replace it with the
    // full error panel including a phone fallback.
    var iframe = document.getElementById("booking-iframe");
    var placeholder = document.getElementById("booking-placeholder");
    var loadingStatus = document.getElementById("booking-loading-status");
    var heading = document.getElementById("booking-placeholder-heading");
    var text = document.getElementById("booking-placeholder-text");
    if (!iframe || !placeholder || !heading || !text) return;

    iframe.hidden = true;
    iframe.setAttribute("src", "");
    if (loadingStatus) loadingStatus.hidden = true;
    heading.textContent = "Booking Unavailable";
    text.textContent = message;
    placeholder.hidden = false;
  }

  function handleAction(action) {
    if (!action) return;
    if (action === "triage") {
      var url = resolveBookingUrl("triage");
      trackEvent("contact_tablet_interact_triage");

      var iframe = document.getElementById("booking-iframe");
      var placeholder = document.getElementById("booking-placeholder");
      if (iframe && placeholder) {
        if (url) {
          // Show a SUBTLE loading hint (status line at bottom only).
          // The iframe area is kept empty/loading — Zoho's content
          // will paint directly into the iframe as it loads, with no
          // visual flash on fast loads.
          iframe.hidden = false;
          showBookingLoading();

          iframe.setAttribute("src", url);

          // Add a 12s fallback in case Zoho never loads (e.g., service is paused,
          // or Zoho server is slow). Only THEN do we replace the iframe area
          // with the full error placeholder.
          var loadTimeout = window.setTimeout(function () {
            var stillLoading =
              iframe.getAttribute("src") === url && iframe.dataset.loaded !== "true";
            if (stillLoading) {
              showBookingError(
                "The booking system is taking longer than expected (Zoho may be temporarily unavailable). Please call " +
                  (config && config.contactPhone ? config.contactPhone : "") +
                  " or email us below to schedule directamente.",
              );
            }
          }, 12000);

          iframe.onload = function () {
            window.clearTimeout(loadTimeout);
            iframe.dataset.loaded = "true";
            // Hide the subtle status line — booking is ready.
            var loadingStatus = document.getElementById("booking-loading-status");
            if (loadingStatus) loadingStatus.hidden = true;
            placeholder.hidden = true;
          };

          // If iframe errors (e.g., Zoho service paused, refusing connections),
          // show the full fallback panel.
          iframe.onerror = function () {
            window.clearTimeout(loadTimeout);
            showBookingError(
              "The booking system rejected the request. This usually means the service is paused. Please call " +
                (config && config.contactPhone ? config.contactPhone : "") +
                " or email us below.",
            );
          };
        } else {
          iframe.hidden = true;
          placeholder.hidden = false;
        }
      }
      switchState("booking");
    } else if (action === "back") {
      switchState("menu");
      var iframe = document.getElementById("booking-iframe");
      if (iframe) {
        iframe.setAttribute("src", "");
        iframe.dataset.loaded = "";
      }
    }
  }

  screen.addEventListener("click", function (e) {
    var target = e.target.closest("[data-tablet-action], [data-analytics-event]");
    if (!target) return;
    var action = target.getAttribute("data-tablet-action");
    if (action) handleAction(action);
    var analyticsEvent = target.getAttribute("data-analytics-event");
    if (analyticsEvent) trackEvent(analyticsEvent);
  });

  root.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var currentKey = null;
      for (var key in states) {
        if (states[key] && !states[key].hidden && key !== "menu") {
          currentKey = key;
          break;
        }
      }
      if (currentKey) {
        switchState("menu");
        var iframe = document.getElementById("booking-iframe");
        if (iframe) iframe.setAttribute("src", "");
      }
    }
  });

  var iframes = screen.querySelectorAll(".tablet-iframe");
  iframes.forEach(function (iframe) {
    iframe.addEventListener("load", function () {
      var type = iframe.getAttribute("data-iframe-type");
      if (type) trackEvent("contact_" + type + "_iframe_loaded");
    });
  });

  switchState("menu");
})();
