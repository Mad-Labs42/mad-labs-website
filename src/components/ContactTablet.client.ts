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
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
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

  function handleAction(action) {
    if (!action) return;
    if (action === "triage" || action === "consult") {
      var url = resolveBookingUrl(action);
      var eventName = action === "triage" ? "contact_tablet_interact_triage" : "contact_tablet_interact_consult";
      trackEvent(eventName);

      var iframe = document.getElementById("booking-iframe");
      var placeholder = document.getElementById("booking-placeholder");
      if (iframe && placeholder) {
        if (url) {
          iframe.hidden = false;
          placeholder.hidden = true;
          iframe.setAttribute("src", url);
        } else {
          iframe.hidden = true;
          placeholder.hidden = false;
        }
      }
      switchState("booking");
    } else if (action === "back") {
      switchState("menu");
      var iframe = document.getElementById("booking-iframe");
      if (iframe) iframe.setAttribute("src", "");
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
