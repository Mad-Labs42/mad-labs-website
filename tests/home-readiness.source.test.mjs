/* global console, process */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const astroConfig = read("astro.config.mjs");
const baseLayout = read("src/layouts/BaseLayout.astro");
const homePage = read("src/pages/index.astro");
const headers = read("public/_headers");
const robots = read("public/robots.txt");

assert.match(
  homePage,
  /<BaseLayout[\s\S]*title="Mobile Computer Repair, Tech Support & AI Solutions in Cincinnati"/,
  "homepage title should describe brand services and Cincinnati locality",
);

assert.match(
  homePage,
  /description="MAD LABS brings mobile computer repair, tech support, and practical AI solutions to Cincinnati homes and small businesses\."/,
  "homepage meta description should be concise, local, and service-aware",
);

assert.match(homePage, /jsonLdType="home"/, "homepage should opt into home JSON-LD");
assert.match(baseLayout, /const canonicalUrl = new URL\(Astro\.url\.pathname, SITE_URL\)/);
assert.match(baseLayout, /<link\s+rel="canonical"\s+href=\{canonicalUrl\.href\}/);
assert.match(baseLayout, /<meta property="og:url" content=\{canonicalUrl\.href\}/);
assert.match(baseLayout, /<meta name="twitter:image" content=\{socialImageUrl\.href\}/);
assert.doesNotMatch(baseLayout, /hreflang=/, "single-language site should not emit hreflang alternates");

assert.match(baseLayout, /PUBLIC_CLARITY_ID \|\| ""/);
assert.doesNotMatch(baseLayout, /x4385g64yq/, "Clarity should not ship with a default project ID");
assert.match(baseLayout, /temporary UX-debugging instrumentation/);
assert.match(baseLayout, /PUBLIC_ENABLE_CLARITY === "true"/);
assert.match(baseLayout, /requestIdleCallback|setTimeout/);

assert.match(baseLayout, /"@type": "WebPage"/);
assert.match(baseLayout, /"@type": "Service"/);
assert.match(baseLayout, /"@id": `\$\{SITE_URL\}\/#local-business`/);
assert.doesNotMatch(baseLayout, /PostalAddress|streetAddress|aggregateRating|review|openingHours/);

assert.match(astroConfig, /import sitemap from "@astrojs\/sitemap";/);
assert.match(astroConfig, /sitemap\(\{/);
assert.match(astroConfig, /filter:\s*\(page\)\s*=>\s*!page\.endsWith\("\/contact\/thank-you\/"\)/);
assert.match(
  astroConfig,
  /writeFileSync\([\s\S]*"robots\.txt"[\s\S]*Sitemap: https:\/\/madlabs\.rocks\/sitemap-index\.xml/,
);
assert.match(robots, /Sitemap: https:\/\/madlabs\.rocks\/sitemap-index\.xml/);

assert.match(headers, /Content-Security-Policy-Report-Only:/);
assert.doesNotMatch(headers, /^\s*Content-Security-Policy:/m);
assert.match(headers, /X-Content-Type-Options: nosniff/);
assert.match(headers, /Referrer-Policy: strict-origin-when-cross-origin/);
assert.match(headers, /Permissions-Policy: camera=\(\), microphone=\(\), geolocation=\(\)/);
assert.doesNotMatch(headers, /\/contact\s*\r?\n\s*X-Robots-Tag:\s*noindex/);
assert.match(headers, /\/contact\/thank-you\s*\r?\n\s*X-Robots-Tag: noindex/);

console.log("home readiness source checks passed");
