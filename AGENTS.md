# AGENTS.md

## Purpose

Maintain rigor, correctness, reproducibility, and low-risk change.
Never trade trustworthiness for convenience.

## Default Behavior

Read this file first.
Read `.agent/README.md` for agent-surface map and script-placement rules.

Read only:

- the source files directly relevant to the task
- the single `.agent/instructions/*` file that matches the task mode, if needed

Do not preload all instructions, policy files, or README/docs.
Do not read session logs, task trackers, or continuity artifacts unless the user explicitly asks to read or update them.

## Automation Boundaries

- Automate low-risk, repetitive tasks when it improves reliability or token efficiency.
- Put agent-authored helper scripts under `.agent/scripts/helpers/`.
- Do not place project runtime or user-facing feature scripts under `.agent/scripts/helpers/`.
- Do not place ad hoc token-saving helper scripts under `src/`, root, or other project runtime paths.
- Keep repository-maintained agent governance scripts under `.agent/scripts/` only.
- Before creating a new `.agent/scripts/*` file, require: concrete problem, immediate value, low blast radius, clear failure mode, and user approval.

## When to Stop and Ask

Stop and ask before proceeding if:

- instructions conflict in a load-bearing way
- the task may change methodology, architecture, or trust semantics
- the correct behavior is unclear
- the change may require broad refactoring not explicitly requested
- project docs and code disagree on an important behavior

Do not resolve major ambiguity unilaterally.

Escalate and ask when:

- a required step would deviate from the user plan or implementation contract
- a choice may impact architecture, cross-module behavior, or major systems
- the request is ambiguous enough that multiple materially different implementations are possible
- executing safely requires irreversible, destructive, or high-blast-radius actions
- dependencies, schema, interfaces, or public behavior would change beyond requested scope

## Conflict Handling

If instructions appear to conflict:

1. identify the conflict clearly
2. inspect only the most relevant source and instruction file
3. if the conflict affects important project behavior, stop and ask

Do not invent policy.
Do not force a resolution silently.

## Code Style Expectations

Write the smallest code that preserves:

- correctness
- clarity
- maintainability
- stability

Required execution behavior:

- Run `pnpm check` and `pnpm build` after each edit batch on touched files before claiming success.
- Run a correctness check appropriate to each changed path before claiming success.
- Update logically affected call sites, tests, docs, and configuration when edits change behavior or interfaces.
- Do not leave known lint or correctness failures unaddressed without explicitly reporting them.

Avoid unnecessary abstraction, wrappers, indirection, and ceremony.

## Working Style

- Prefer narrow, targeted reads.
- Prefer small, auditable patches.
- Avoid cosmetic churn.
- Verify before claiming success.
- State uncertainty explicitly.
- Treat linting and correctness checks as required work, not optional follow-up.

## Response Token Discipline

- Use the fewest words that still preserve full meaning and required detail.
- Remove filler, repetition, and restatement.
- Never omit critical facts, risks, assumptions, blockers, or required user questions to save tokens.
- If brevity conflicts with completeness, keep completeness and be concise elsewhere.

## `.agent/instructions` Dispatch

Read `.agent/instructions/<file>` matching the current session mode:

- `agent_session_bootstrap.md` — executed at session start for all modes
- `implementation_mode_harness.md` — loaded when implementation is approved
- `investigation_only_harness.md` — loaded when in investigate/plan-only mode

Do not read all `.agent/instructions/*` files for a normal task — read only the mode-appropriate harness.

## Output

Report briefly:

- what changed
- what was verified
- what remains uncertain

Use only needed sections from: Outcome, Changes, Verification, Risks, Questions, Next Step.
If blocked only by user input, respond with Questions only.
Include Questions whenever answers are required to proceed; use `NA` when no questions are needed but the section is required.

Optional footer rule:

- If and only if the agent created or edited user-benefit planning/support files (for example pre-implementation plans, implementation plans, validations, walkthroughs, task lists, or TODOs), append one final bottom-only section named `Files Created/Edited for You`.
- That section must appear at the very end of the response and nowhere else.
- Do not include that section when no such files were created or edited.

When blocked and asking Questions, include concise context for each question:

- what is blocked and why it blocks progress now
- immediate concerns the user should know
- impact level (`low|medium|high|major`) if the answer could change scope or implementation
- impact summary when relevant (major rewrite, architecture change, destructive action, file deletion, or cross-system effects)

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
- **Figma MCP:** available but gated — only activate when user says **"FIGMA is a GO!"**
- **Cloudflare API MCP:** disabled unless user explicitly approves
- **Figma-Desktop MCP:** available when Figma Desktop app is running on Windows (reachable from WSL)
- **Playwright MCP:** available for browser checks
- **Cloudflare Docs MCP:** available for reference

### What This Project Is NOT
- Not Next.js
- Not React-first
- Not database-backed
- Not Vercel/Netlify targeted
- No legacy Tailwind config style
