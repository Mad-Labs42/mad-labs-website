# .agent Directory Map

This folder contains agent-facing policy, instruction, automation, and generated continuity artifacts.

**Usage labels:**
- `[ONBOARDING]` — read or run during the onboarding flow
- `[ON-DEMAND]` — read only when the current task requires it
- `[AWARENESS]` — exists for reference; do not preload or run unless explicitly requested
- `[INTERNAL]` — used by other scripts; do not invoke directly

All work happens in WSL directly. No PowerShell bridge.

## scripts

- *(none yet)* — agent automation scripts go here when created per AGENTS.md automation boundary rules.

## scripts/helpers

- *(none yet)* — agent-authored helper scripts go here when created per AGENTS.md automation boundary rules.

## instructions

- `[ONBOARDING]` instructions/agent_session_bootstrap.md: First-session lock-in payload for instruction chain and execution rules. Read during onboarding flow.
- `[ON-DEMAND]` instructions/implementation_mode_harness.md: Scope-bound execution harness for approved implementation work.
- `[ON-DEMAND]` instructions/investigation_only_harness.md: Hard no-edit gate for investigate/plan-only sessions.

## Notes

- This README should be updated whenever files are added, removed, or renamed under .agent.

## Changelog

### 2026-05-12

- Initial port from QuantMap governance structure.
- Adapted for Mad Labs website (Astro + TypeScript + pnpm + Tailwind v4).
- No PowerShell bridge — all work in WSL directly.
- Standard command workflow uses `pnpm check` and `pnpm build`.
