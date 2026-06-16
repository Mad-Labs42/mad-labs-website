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
- **Stack:** Astro 5 + TypeScript strict + Tailwind v4 (CSS @import) + pnpm 10
- **Deployment:** Cloudflare Pages (static)
- **Visual:** CRT/neon retro — beige CRT bezel, purple screen, warm amber, green LED
- **GitHub:** `Mad-Labs42/mad-labs-website` (remote TBD)

## LFCM (Lifecycle Manager)

- **NOT a daemon.** Event-driven post-cron sweeper.
- Triggered 2 min after every cron job exits.
- Sweeps for 5 minutes, then exits.
- 7-condition safety check before any kill.
- See: `Stack-Docs/LFCM/` for full documentation.
