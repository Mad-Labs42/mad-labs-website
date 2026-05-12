# Agent Session Bootstrap

Use this as the first-message payload in a new coding-agent session.

## Mission

Execute the user request with minimal risk, high correctness, and strict token discipline.
Use this file as an execution checklist, not a duplicate policy source.

## Mandatory Instruction Chain

1. Read AGENTS.md.
2. Read .agent/README.md.
3. Read .agent/instructions/agent_session_bootstrap.md (this file).
4. Read .agent/instructions/implementation_mode_harness.md or investigation_only_harness.md matching the mode.
5. Do not preload all instruction files, README, or policy docs.
6. Do not read session logs, task trackers, or continuity artifacts unless user explicitly asks.

## Automation and Token Efficiency

- Look for safe automation opportunities before manual repetitive work.
- Prefer existing standard command workflows (`pnpm check`, `pnpm build`) for repeated tasks first.
- Use automation to reduce token usage in both execution and reporting.
- If a repeated task is not automated and can be safely scripted with low blast radius, create a small helper script in `.agent/scripts/helpers/`.
- Do not automate destructive, high-risk, or ambiguous operations without explicit user approval.
- Do not place project runtime or product feature scripts in `.agent/scripts/helpers/`.
- Do not place ad hoc token-saving helper scripts under `src/`, root, or other project runtime paths.
- Keep repository-maintained governance scripts under `.agent/scripts/` only.
- Before creating a new `.agent/scripts/*` file, require: concrete problem, immediate value, low blast radius, clear failure mode, and user approval.

## Escalation Rules (Ask Before Proceeding)

- Required step would deviate from user plan.
- Decision may alter architecture, major systems, or cross-module behavior.
- Scope, intent, or acceptance criteria are unclear.
- Action is destructive, irreversible, or high blast radius.
- Dependency/schema/interface/public behavior changes exceed request.
- Code and docs disagree on expected behavior.

## Investigation-Only Mode

- If the user says investigate/propose/plan/do not implement/wait for approval, stop after findings and proposals.
- Permission to install dependencies or run read-only investigation commands is not permission to implement changes.
- Before the first file-modifying action in investigation-only mode, ask for explicit go-ahead in one sentence.

## Response Rules

- Use only needed sections: Outcome, Changes, Verification, Risks, Questions, Next Step.
- If blocked only by user input, respond with Questions only.
- Keep output concise but do not omit load-bearing facts or intricate details the user should be aware of.

## Blocking Question Format

For each blocking question include:

- Question: decision needed from user.
- Blocker: what is blocked and why.
- Why This Matters Now: immediate concern/dependency.
- Impact Level: low|medium|high|major.
- Impact If Wrong/Assumed: include when relevant.

Use impact level `major` for architecture changes, major rewrites, destructive operations, file deletions, or cross-system effects.

## Standard Command Workflow

1. `pnpm check` — Astro/TypeScript/import sanity check. Do not proceed if this fails.
2. `pnpm build` — production build validation. Run before any implementation work that touches components, layouts, or styles.
3. Implement scoped changes.
4. `pnpm check` again — verify no type/import regressions.
5. `pnpm build` again — verify no build regressions.
6. If `.agent/` docs or scripts changed, run any agent workflow smokecheck equivalent if one exists.

Do not begin implementation until step 1 passes.

### Repair Procedure
If `pnpm check` fails due to missing dependencies, run `pnpm install` then retry.
If `pnpm build` fails, check the error message, fix the issue, then retry from step 4.

## Script Intent (When to Use)

- *(No agent automation scripts exist yet; this section expands as scripts are added.)*

## Session Task Brief

When user provides a long implementation plan, compress into this working brief and use it as execution memory:

- Goal
- Constraints
- In-Scope Files
- Out-of-Scope
- Checks
- Done When
- Open Questions

Do not repeatedly restate the full user plan unless asked.

## Key Project Facts

### Stack
- **Framework:** Astro + TypeScript
- **Package manager:** pnpm
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin + CSS `@import` only
- **No:** `@astrojs/tailwind`, `tailwind.config.*`, or React-first patterns
- **Deployment target:** Cloudflare Pages (static)
- **`/functions` at root:** reserved for future Cloudflare Pages Functions — do not touch

### Repo Paths
- **WSL:** `/mnt/d/Workspaces/mad-labs-website`
- **Windows:** `D:\Workspaces\mad-labs-website`

### Important Source Files
- `src/pages/index.astro` — homepage
- `src/pages/services.astro` — services page
- `src/pages/about.astro` — about page
- `src/pages/contact.astro` — contact page
- `src/layouts/BaseLayout.astro` — base layout wrapper
- `src/components/CrtHero.astro` — CRT hero section
- `src/components/CrtTypingLabel.astro` — CRT typing animation label
- `src/components/CrtDivider.astro` — CRT divider component
- `src/components/CrtTaskbar.astro` — CRT taskbar component
- `src/styles/global.css` — global styles and design tokens
- `astro.config.mjs` — Astro configuration

### Design Tokens & Styling
- Global styles and design tokens live in `src/styles/global.css`
- CRT hero styling is component-local in `CrtHero.astro`
- Tailwind comes through Vite plugin plus CSS import only — no config file
- Fonts: Jersey 25, Monofett, VT323, local Early GameBoy

### Dev Server
- `pnpm dev --host 0.0.0.0`

### MCP Availability
- **Figma MCP:** available but gated — only activate when user says "FIGMA is a GO!"
- **Cloudflare API MCP:** disabled unless user explicitly approves
- **Figma-Desktop MCP:** available when Figma Desktop app is running on Windows
- **Playwright MCP:** available for browser checks
- **Cloudflare Docs MCP:** available for reference

### What This Project Is NOT
- Not Next.js
- Not React-first
- Not database-backed
- Not Vercel/Netlify targeted
- No legacy Tailwind config style
