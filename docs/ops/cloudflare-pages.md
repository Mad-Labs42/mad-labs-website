# Cloudflare Pages — MAD LABS deployment ops

Repo source of truth for **how this project is deployed**. Dashboard/API values live in Cloudflare; this doc records what agents need without rediscovering state.

**Official references:**
- [Pages build image](https://developers.cloudflare.com/pages/configuration/build-image/) — v3 defaults, `NODE_VERSION` / `PNPM_VERSION` overrides
- [Preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Branch build controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)

---

## Project identity

| Item | Value |
|------|-------|
| **Pages project** | `mad-labs-website` |
| **GitHub repo** | `Mad-Labs42/mad-labs-website` |
| **Production branch** | `main` |
| **Active dev / preview branch** | `dev` |
| **Production domain** | `https://madlabs.rocks` (also `www.madlabs.rocks`) |
| **Preview branch alias** | `https://dev.mad-labs-website.pages.dev` |
| **pages.dev subdomain** | `mad-labs-website.pages.dev` |

Preview deployments also get per-commit URLs: `https://<deployment-id>.mad-labs-website.pages.dev`  
Example (Slice 7): `https://87d792c4.mad-labs-website.pages.dev`

---

## Build configuration

| Setting | Value |
|---------|-------|
| **Build command** | `pnpm build` |
| **Output directory** | `dist` |
| **Build image** | **v3** (`build_image_major_version: 3`) |
| **`NODE_VERSION`** | `24.18.0` (pinned in Cloudflare preview + production env) |
| **`PNPM_VERSION`** | `11.9.0` (pinned in Cloudflare preview + production env) |

v3 build image defaults to Node 22 unless overridden — see [override default versions](https://developers.cloudflare.com/pages/configuration/build-image/#override-default-versions). This project pins Node/pnpm to match `package.json`, `pnpm-workspace.yaml`, and CI.

**Preview branch policy:** all branches (`preview_deployment_setting: all`, includes `*`). Pushes to `dev` produce preview deployments; merges to `main` produce production.

---

## Environment variables (dashboard-owned)

These are **not** in the repo. Change only in Cloudflare dashboard or Pages API — never commit secrets.

### Production only

| Variable | Purpose |
|----------|---------|
| `PUBLIC_GA4_MEASUREMENT_ID` / `PUBLIC_GA_ID` | Google Analytics 4 |
| `PUBLIC_CLARITY_ID` | Microsoft Clarity |
| `PUBLIC_ENABLE_CLARITY` | Clarity on/off gate |
| `PUBLIC_ZOHO_BOOKING_URL` | Zoho Bookings embed |
| `PUBLIC_BOOKING_EMBED_URL` | Booking portal embed base |
| `PUBLIC_BOOKING_NIMBUSPOP_SRC` | Nimbuspop embed script |

### Preview

Intentionally **build pins only** (`NODE_VERSION`, `PNPM_VERSION`) unless explicitly expanded later. Preview should not inherit production analytics/booking toggles by accident.

### Also dashboard-owned (not env vars)

- `compatibility_date` — currently `2026-06-24` (preview + production)
- Custom domain bindings for `madlabs.rocks` / `www.madlabs.rocks`
- Git integration: PR comments enabled

---

## Indexing expectations

| Environment | `x-robots-tag` | Notes |
|-------------|----------------|-------|
| **Preview** (`*.pages.dev`, branch alias) | `noindex` | Verified on all main routes (Slice 7). Re-check after deploy changes. |
| **Production** (`madlabs.rocks`) | **must not** include `noindex` | Production is the indexable public site. |

---

## Deployment safety rules

1. **`dev` only** for improvement work; do **not** merge to `main` unless explicitly directed.
2. Do **not** alter production custom domains or DNS without explicit approval.
3. Do **not** change dashboard env vars, build settings, or branch controls in a docs-only slice.
4. Static Astro output only — no Workers, Pages Functions, or adapter changes unless a future slice targets them.
5. When updating Cloudflare config via API, **merge** production `PUBLIC_*` vars — PATCH replaces the full `env_vars` object.
6. After Cloudflare changes, verify preview **and** production with curl (below) before claiming success.
7. Local deploy script (`pnpm deploy`) targets production branch `main` — use with care; prefer Git-integrated preview flow on `dev`.

---

## Verify preview and production

```bash
# Preview branch alias — expect 200 + x-robots-tag: noindex
curl -sI https://dev.mad-labs-website.pages.dev/ | rg -i 'HTTP/|x-robots-tag'

# Production — expect 200, no x-robots-tag: noindex
curl -sI https://madlabs.rocks/ | rg -i 'HTTP/|x-robots-tag'

# Route smoke (preview) — all should return 200
for p in / /services/ /about/ /contact/ /privacy/; do
  curl -s -o /dev/null -w "%{http_code} $p\n" "https://dev.mad-labs-website.pages.dev$p"
done
```

Build log sanity (after a deploy): look for `nodejs@24.18.0` and `pnpm@11.9.0` in the Pages build output.

---

## Local parity

| Check | Command |
|-------|---------|
| Install | `pnpm install --frozen-lockfile` |
| Full CI lane | `pnpm ci` |
| Local preview | `pnpm build && pnpm preview` → `http://127.0.0.1:4322/` |

Repo pins: Node `>=24.18.0 <25`, pnpm `11.9.0` — keep aligned with Cloudflare build env.

---

## Change log

| Date | Slice | Notes |
|------|-------|-------|
| 2026-06-30 | 7 | Aligned preview deploy; pinned `NODE_VERSION` / `PNPM_VERSION` via Pages API |
| 2026-06-30 | 8 | This document added |
