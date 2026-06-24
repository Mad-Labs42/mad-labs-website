/* global console, process */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const contactPage = read("src/pages/contact.astro");
const contactTablet = read("src/components/ContactTablet.astro");
const contactTabletClient = read("src/components/ContactTablet.client.ts");
const baseLayout = read("src/layouts/BaseLayout.astro");
const headers = read("public/_headers");

assert.match(contactPage, /id="contact-info-col"/, "contact skip-to-info target should exist");
assert.match(
  contactPage,
  /id="contact-tablet-instructions"/,
  "contact tablet instructions should expose an ID for region description",
);

assert.match(
  contactTablet,
  /role="region"/,
  "contact tablet should remain a named region",
);
assert.match(
  contactTablet,
  /aria-describedby="contact-tablet-instructions"/,
  "contact tablet region should reference the visible instruction text",
);
assert.match(
  contactTablet,
  /aria-busy="true"/,
  "contact tablet should expose loading state while the booking widget initializes",
);
assert.match(
  contactTablet,
  /id="booking-loading-status"[\s\S]*Loading the booking calendar\. The appointment form will appear here in a moment\./,
  "contact tablet should include a descriptive screen-reader loading announcement",
);

assert.match(
  contactTabletClient,
  /iframe\.setAttribute\("title", "Book a free 20-minute tech call with MAD LABS"\)/,
  "booking iframe should receive a meaningful title",
);
assert.match(
  contactTabletClient,
  /bookingStatus\.textContent = "Booking calendar loaded\. You can now choose a time\."/,
  "booking status should announce when the widget is ready",
);
assert.match(
  contactTabletClient,
  /bookingStatus\.textContent =[\s\S]*Booking calendar failed to load\. Call or email MAD LABS instead\./,
  "booking status should announce fallback guidance on load failure",
);
assert.match(
  contactTabletClient,
  /tabletRoot\.setAttribute\("aria-busy", "false"\)/,
  "booking region should clear aria-busy once loading finishes",
);

assert.doesNotMatch(baseLayout, /hreflang=/, "BaseLayout should not emit hreflang alternates");
assert.match(headers, /Content-Security-Policy-Report-Only:/, "CSP should remain report-only");
assert.match(headers, /\/contact\/thank-you\s*\r?\n\s*X-Robots-Tag: noindex/);
assert.doesNotMatch(headers, /^\s*Content-Security-Policy:/m, "CSP should not be enforcing yet");

console.log("launch readiness source checks passed");
