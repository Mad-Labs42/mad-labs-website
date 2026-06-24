/**
 * scrollReveal.ts — Shared IntersectionObserver scroll-reveal utility.
 *
 * Observes elements and applies a CSS reveal transition when they enter
 * the viewport. Uses standard CSS transitions (opacity, transform, filter)
 * for GPU-accelerated animation. Falls back to native CSS View Timeline
 * when available (`animation-timeline: view()`).
 *
 * Usage:
 *   import { observeScrollReveal } from "../utils/scrollReveal";
 *   observeScrollReveal(".lab-section, .lab-section-alt", { threshold: 0.15 });
 *
 * The target elements should have these initial CSS styles:
 *   opacity: 0;
 *   transform: translateY(18px);
 *   filter: blur(2px);
 *   transition:
 *     opacity 0.6s ease-out,
 *     transform 0.6s ease-out,
 *     filter 0.6s ease-out;
 */

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

const defaultOptions: ScrollRevealOptions = {
  threshold: 0.15,
};

/**
 * Sets up an IntersectionObserver to reveal elements with a fade-in/up effect.
 * Skips initialization if the browser supports CSS View Timeline (animation-timeline).
 */
export function observeScrollReveal(selector: string, options: ScrollRevealOptions = {}): void {
  // Respect reduced motion — users who prefer reduced motion skip animation entirely
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    // Elements start visible; no animation needed
    document.querySelectorAll(selector).forEach((el) => {
      const target = el as HTMLElement;
      target.style.opacity = "1";
      target.style.transform = "translateY(0)";
      target.style.filter = "blur(0)";
    });
    return;
  }

  // Skip if the browser supports the modern CSS View Timeline API
  if (CSS.supports("animation-timeline", "view()")) {
    return;
  }

  const { threshold = 0.15, rootMargin = "0px" } = { ...defaultOptions, ...options };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.style.opacity = "1";
          target.style.transform = "translateY(0)";
          target.style.filter = "blur(0)";
          observer.unobserve(target);
        }
      });
    },
    { threshold, rootMargin },
  );

  // Elements exist in the DOM by the time a module script runs (deferred),
  // so no requestAnimationFrame wrapper needed
  document.querySelectorAll(selector).forEach((el) => observer.observe(el));
}
