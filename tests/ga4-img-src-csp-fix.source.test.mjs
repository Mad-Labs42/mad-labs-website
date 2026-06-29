import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const headers = readFileSync(resolve(process.cwd(), "public/_headers"), "utf8");

assert.match(
  headers,
  /img-src[^;]*https:\/\/www\.googletagmanager\.com/,
  "CSP img-src should allow the observed GA4 Google tag image beacon",
);
assert.doesNotMatch(headers, /img-src[^;]*(?:\s\*|\shttps:)(?:\s|;)/, "img-src should stay narrow");

console.log("GA4 img-src CSP source checks passed");
