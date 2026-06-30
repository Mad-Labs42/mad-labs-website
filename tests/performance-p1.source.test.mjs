/* global console, process */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const headers = read("public/_headers");
const homePage = read("src/pages/index.astro");
const mobileHero = read("src/components/MobileHomeHero.astro");

assert.equal(
  existsSync(resolve(root, "public/MEDIA:!madlabs_logo_test.png")),
  false,
  "unused 600KB test logo PNG should not ship from public/",
);

for (const route of ["/_astro/*", "/fonts/*"]) {
  const escapedRoute = route.replaceAll("/", "\\/").replaceAll("*", "\\*");
  assert.match(
    headers,
    new RegExp(`${escapedRoute}\\s*\\r?\\n\\s*Cache-Control: public, max-age=31536000, immutable`),
    `${route} should use long immutable caching for fingerprinted/static performance assets`,
  );
}
assert.doesNotMatch(
  headers,
  /Cache-Control:\s*public,\s*no-transform/i,
  "cache policies must not use no-transform while Cloudflare analytics injection is intentional",
);

assert.match(
  mobileHero,
  /@media\s*\(max-width:\s*768px\)[\s\S]*\.mobile-hero-inner \.mobile-atom-slot :global\(\.atom-orbit-highlight\)[\s\S]*animation:\s*none;/,
  "mobile atom should disable paint-heavy orbit highlight shimmer while keeping the atom visible",
);
assert.match(
  mobileHero,
  /@media\s*\(max-width:\s*768px\)[\s\S]*\.mobile-hero-inner \.mobile-atom-slot :global\(\.atom-nucleus-halo\)[\s\S]*animation:\s*none;/,
  "mobile atom should disable paint-heavy nucleus shimmer",
);
assert.doesNotMatch(
  homePage,
  /@keyframes\s+lab-section-rise[\s\S]*filter:/,
  "home section reveal should avoid filter animation and use compositor-friendly opacity/transform",
);
assert.doesNotMatch(
  homePage,
  /target\.style\.filter/,
  "scroll reveal fallback should avoid writing paint-heavy filter styles",
);

console.log("performance P1 source checks passed");
