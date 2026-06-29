import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const headers = read("public/_headers");
const homeReadiness = read("tests/home-readiness.browser.mjs");
const privacyReadiness = read("tests/privacy-readiness.browser.mjs");

assert.match(
  headers,
  /script-src[^;]*https:\/\/static\.cloudflareinsights\.com/,
  "CSP script-src should allow the Cloudflare Web Analytics beacon",
);
assert.match(
  headers,
  /connect-src[^;]*'self'/,
  "CSP connect-src should keep same-origin reporting enabled",
);
assert.match(
  headers,
  /connect-src[^;]*https:\/\/cloudflareinsights\.com/,
  "CSP connect-src should allow Cloudflare Web Analytics reporting",
);
assert.doesNotMatch(
  headers,
  /Cache-Control:\s*public,\s*no-transform/i,
  "Cloudflare beacon injection should not be blocked by a no-transform cache policy",
);

assert.match(
  homeReadiness,
  /const baseUrl = process\.env\.MAD_LABS_TEST_URL \|\| "http:\/\/127\.0\.0\.1:4322";/,
  "home readiness browser smoke should respect MAD_LABS_TEST_URL",
);
assert.match(
  homeReadiness,
  /page\.goto\(new URL\("\/", baseUrl\)\.toString\(\)/,
  "home readiness browser smoke should build its target URL from the shared base URL",
);
assert.match(
  privacyReadiness,
  /const baseUrl = process\.env\.MAD_LABS_TEST_URL \|\| "http:\/\/127\.0\.0\.1:4322";/,
  "privacy readiness browser smoke should respect MAD_LABS_TEST_URL",
);

console.log("cloudflare analytics CSP source checks passed");
