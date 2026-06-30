# AGENTS.md — MAD LABS Workspace Context

## About This File

This file is AUTOMATICALLY LOADED by Hermes Agent at session start. It shapes how I behave in this workspace. Keep it focused on facts, conventions, and constraints.

## Memory Protocol

**MEMORY.md is for LONG-TERM DURABLE FACTS ONLY:**
- User preferences and corrections
- Tool quirks and environment facts
- Stable conventions and decisions
- Paths, ports, project identity

**DO NOT write to MEMORY.md:**
- Session outcomes or task results
- Temporary decisions
- What was discussed in the last session
- PR numbers, commit SHAs, file counts

**Write session details to:** `Operations/Sessions/YYYY-MM-DD-HHMM-topic.md`

## Safety Rules

1. **NEVER delete information** — condense, combine, preserve
2. **NEVER modify another profile's files** without explicit direction
3. **NEVER commit secrets** to git
4. **ALWAYS use `patch()` for targeted edits** — never `write_file()` on existing files unless replacing entirely
5. **ALWAYS verify tool arguments** against source-of-truth before invoking

## Recovery Protocol (SISIC Guardrails)

When a tool call fails:

1. **CLASSIFY**: connection error / auth error / data error / timeout / unknown
2. **CHECK BOUNDARIES**:
   - About to delete something you didn't create? → DON'T. Retry instead.
   - About to modify config files? → DON'T. Retry instead.
   - About to kill something you didn't spawn? → DON'T. Retry instead.
   - About to reinstall packages? → DON'T. Retry instead.
3. **RETRY**: For MCP failures, simply retry the tool call (Hermes lazy-spawns)
4. **ESCALATE**: After 3 failures, log to Obsidian Error-Logs and STOP
5. **NEVER "burn down the house"** to fix a blocked pipe

Hard limits:
- Max 3 recovery attempts per failure
- Never modify .env or config.yaml as recovery
- Never delete files not created this session
- Never kill PIDs not spawned by this session

## FROM THE BOSS MAN

Josh adds "FROM THE BOSS MAN" sections to memory.md files across the Obsidian vault. These are **IMMUTABLE instructions** that override any conflicting agent guidance. When agent instructions differ from BOSS MAN, the discrepancy MUST be flagged to Josh — do NOT silently choose one.

## Project Context

- **Workspace:** `/mnt/d/Workspaces/mad-labs-website`
- **Stack:** Astro 7 + TypeScript 6 strict + Tailwind v4 (CSS @import) + pnpm 11.9.0 + Node 24.18 LTS
- **Deployment:** Cloudflare Pages (static)
- **Visual:** CRT/neon retro — beige CRT bezel, purple screen, warm amber, green LED
- **GitHub:** `Mad-Labs42/mad-labs-website` (remote TBD)
- **Platform & Tool Documenation:** `"C:\Users\PC\Desktop\Igors Chambers\Igors Personal Vault\Stack-Docs"` local dev knowledge base full of dev docs
- **Branches:** `dev` is the active improvement lane; `main` is production — do not modify `main` unless explicitly directed.

## Dev Branch Mission

The site works and has an approved identity. Work on `dev` **elevates** it — ultra-premium craft, senior execution, MAD LABS style — as a portfolio proof point for prospective webdev clients.

**Every change should advance one or more of:**

| Area | Intent |
|------|--------|
| **Visuals** | Sharper hierarchy, richer polish, tighter cohesion — CRT/neon retro intact |
| **Animations** | Intentional motion, refined timing, `prefers-reduced-motion` respected |
| **Responsiveness** | Solid across viewports and input types |
| **Performance** | Core Web Vitals, bundle weight, render path — measurable gains |
| **Accessibility** | Keyboard, focus, contrast, landmarks, reduced motion |
| **SEO / local SEO** | Discoverability, meta/schema, sitemap, local signals |
| **AEO** | Answer-engine-ready structure, clear entity signals |
| **Stability** | Fewer regressions, guarded signature components, source tests |
| **Infrastructure** | Tooling, CI, deps, Cloudflare Pages static deploy, Zoho/booking |
| **Cohesiveness** | One product feel across pages, breakpoints, conversion paths |

**Identity:** Stay retro, CRT, atomic, neon, technical, playful, confident — more premium, not generic.

**Constraints:**
- Do not flatten, redesign, or casually simplify signature visuals (CrtHero, contact tablet, CRT effects, booking flow).
- Never invent business facts (address, hours, reviews, ratings, awards, certifications).
- Preserve privacy-first analytics, CSP, and booking behavior.
- No casual stack changes — justify packages, migrations, or refactors by clear impact on site health.
- Hard upgrades worth doing: document impact; owner decides.
- Prefer official docs and live tooling over stale assumptions. Test before claiming success. Stop at slice boundaries.

## LFCM (Lifecycle Manager)

- **NOT a daemon.** Event-driven post-cron sweeper.
- Triggered 2 min after every cron job exits.
- Sweeps for 5 minutes, then exits.
- 7-condition safety check before any kill.
- See: `Stack-Docs/LFCM/` for full documentation.

## Browser CDP (Hermes `browser_cdp` + Puppeteer Chrome 149)

Use this for viewport emulation, layout metrics, and screenshots on **local preview/production URLs** — not only the chrome-devtools MCP.

**Chrome binary (madlabs-website profile):**

`/home/hitchhiker/.hermes/profiles/madlabs-website/home/.cache/puppeteer/chrome/linux-149.0.7827.22/chrome-linux64/chrome`

(Config may also set this via `--executablePath` on chrome-devtools MCP; gateway restart required after config changes.)

**Required pattern for `browser_cdp`:**

1. `browser_navigate` to the URL first (attaches a CDP session).
2. `browser_cdp` → `Target.getTargets` → take the **page** target’s `targetId`.
3. Pass **`target_id`** on every page-scoped CDP call (`Emulation.setDeviceMetricsOverride`, `Runtime.evaluate`, `Page.captureScreenshot`). Calls **without** `target_id` often fail with `'Emulation.setDeviceMetricsOverride' wasn't found`.
4. Standard viewports for this site: **375** (mobile), **768** (tablet), **1280** (desktop). Re-run `Runtime.evaluate` after each emulation change.

**Preview URL for audits:** `pnpm build && pnpm preview` → typically `http://127.0.0.1:4322/`.

**Prefer chrome-devtools MCP** for full workflows (console, network, trace) when enabled; use **`browser_cdp`** when you already have an active Hermes browser session or need raw CDP on the Puppeteer Chrome attached to the agent.

**Do not** use `~` in `terminal()` paths in this profile — use `/home/hitchhiker/...` absolutes (`$HOME` is profile-scoped).
