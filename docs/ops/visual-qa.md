# Visual QA and motion guardrails

Lightweight Playwright checks before premium visual or animation work. **Guardrails only** — not visual regression baselines.

## Prerequisites

1. Build the site: `pnpm build`
2. Serve the production build: `pnpm preview` (default `http://127.0.0.1:4322/`)
3. In another terminal, run the guardrail script.

Point tests at a different origin with `MAD_LABS_TEST_URL` (preview deploy, branch alias, etc.).

## Commands

```bash
# Guardrail suite (Slice 9 entry point)
pnpm test:visual

# Optional: existing browser smoke scripts (same preview URL)
node tests/launch-readiness.browser.mjs
node tests/performance-animation-smoke.browser.mjs
node tests/home-readiness.browser.mjs
```

## What `pnpm test:visual` checks

| Area | Coverage |
|------|----------|
| **Routes** | `/`, `/services/`, `/about/`, `/contact/`, `/privacy/` |
| **Viewports** | mobile 375, tablet 768, desktop 1280 |
| **HTTP** | 200 response |
| **Console** | no `console.error` |
| **Layout** | no obvious horizontal overflow (≤2px) |
| **Brand** | visible MAD LABS header/hero content |
| **SEO safety** | production routes must **not** have `noindex` meta |
| **Contact** | booking tablet + `#inline-container iframe` on `/contact/` |
| **Reduced motion** | home selects mobile hero (CRT hidden); contact embed still loads |

## Optional artifacts

Screenshots are **off** by default (nothing written to `artifacts/`).

```bash
MAD_LABS_VISUAL_QA_SCREENSHOTS=1 pnpm test:visual
```

`artifacts/` is gitignored.

## Related tests

| Script | Focus |
|--------|-------|
| `tests/visual-qa-guardrail.browser.mjs` | Consolidated guardrail (this slice) |
| `tests/launch-readiness.browser.mjs` | Launch gate: canonical, JSON-LD, contact embed |
| `tests/home-hero-policy.browser.mjs` | CrtHero/mobile hero selection matrix |
| `tests/performance-animation-smoke.browser.mjs` | Hidden-branch animation smoke |
| `tests/*.source.test.mjs` | Static source policy (`pnpm test:source`) |

Agent skill: `.agents/skills/madlabs-visual-qa-guardrail/` for protected components and audit workflow.
