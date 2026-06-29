/* global console, process */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const privacyPath = "src/pages/privacy.astro";

assert.ok(
  existsSync(resolve(root, privacyPath)),
  "privacy route should exist at src/pages/privacy.astro",
);

const privacy = read(privacyPath);
const baseLayout = read("src/layouts/BaseLayout.astro");
const astroConfig = read("astro.config.mjs");

assert.match(privacy, /<BaseLayout[\s\S]*title="Privacy Policy"/);
assert.match(
  privacy,
  /description="Plain-English privacy policy for MAD LABS: what we collect, what we don't do, and how temporary site diagnostics are used\."/,
);
assert.doesNotMatch(privacy, /noindex/i, "privacy page should be indexable");

for (const heading of [
  "Privacy Protocol",
  "Containment Protocol",
  "What We Collect",
  "What We Don't Do",
  "Temporary Debugging Window",
  "When You Contact the Lab",
  "Third-Party Tools",
  "Your Move",
]) {
  assert.match(privacy, new RegExp(`>${heading}<`), `privacy page should include ${heading}`);
}

for (const required of [
  "Your data is not lab fuel.",
  "We do not sell your data.",
  "We do not run ad pixels or remarketing.",
  "Microsoft Clarity",
  "Google Analytics 4",
  "Cloudflare Web Analytics/RUM",
  "Zoho Bookings/Nimbuspop",
  "clicks",
  "scroll",
  "session replay",
  "page views",
  "booking provider",
  "Zoho",
  "Cloudflare",
  "Last updated: June 29, 2026",
]) {
  assert.ok(privacy.includes(required), `privacy copy should include: ${required}`);
}

for (const forbidden of [
  "absolutely no data",
  "GDPR compliant",
  "CCPA compliant",
  "heretofore",
  "aforementioned",
  "pursuant",
  "TODO",
  "Last updated: June 19, 2026",
]) {
  assert.doesNotMatch(
    privacy,
    new RegExp(forbidden, "i"),
    `privacy page should avoid ${forbidden}`,
  );
}

assert.match(baseLayout, /<a href="\/privacy\/" class="footer-privacy-link">Privacy<\/a>/);
assert.doesNotMatch(baseLayout, /TODO: add Privacy link|footer privacy TODO/i);
assert.match(baseLayout, /PUBLIC_CLARITY_ID \|\| ""/);
assert.match(baseLayout, /PUBLIC_ENABLE_CLARITY === "true"/);
assert.doesNotMatch(baseLayout, /PUBLIC_ENABLE_CLARITY !== "false"/);
assert.match(baseLayout, /requestIdleCallback/);

assert.match(astroConfig, /filter:\s*\(page\)\s*=>\s*!page\.endsWith\("\/contact\/thank-you\/"\)/);
assert.doesNotMatch(astroConfig, /privacy/, "privacy should rely on default sitemap inclusion");

console.log("privacy readiness source checks passed");
