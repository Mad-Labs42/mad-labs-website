# MAD LABS Website

Professional website for **MAD LABS** — a computer repair and mobile IT services business.

## Stack

- **Framework:** [Astro](https://astro.build) 5 (static output)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com) 4 (via `@tailwindcss/vite` plugin + CSS `@import "tailwindcss"`)
- **Package Manager:** [pnpm](https://pnpm.io) 10
- **Hosting:** Cloudflare Pages (static, ready for future serverless functions via root `functions/`)

## Project Structure

```
mad-labs-website/
├── src/
│   ├── pages/        # Route files
│   ├── layouts/      # Layout components
│   ├── components/   # UI components (future)
│   ├── data/         # Business facts (future)
│   ├── content/      # Content/blog/services (future)
│   └── styles/       # Global CSS (Tailwind 4)
├── functions/        # Cloudflare Pages Functions (reserved; no handlers yet)
├── public/           # Static assets
├── docs/             # Project documentation, strategy, decisions
├── .github/          # CI workflows
├── .vscode/          # Editor settings
├── .hermes.md        # Hermes Agent project configuration
└── README.md
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Type checking
pnpm check

# Lint
pnpm lint

# Format
pnpm format

# Production build
pnpm build

# Preview production build
pnpm preview

# Full validation (CI)
pnpm ci
```

## Validation Pipeline

Every push/PR runs: `pnpm install → pnpm check → pnpm lint → pnpm format:check → pnpm build`

## Memory & Context

This project uses a **dedicated Hindsight memory bank** to isolate it from all other projects.
See [docs/memory-strategy.md](docs/memory-strategy.md) for details.

## Tooling

| Tool | Purpose |
|------|---------|
| Playwright MCP | Browser automation / visual smoke tests |
| Cloudflare Docs MCP | Cloudflare documentation search |
| Figma MCP | Design reviews (reserved — see Figma Gate below) |
| Cloudflare API MCP | **Configured but disabled** until explicitly approved |

## Figma Gate

**Figma must NOT be used for any design work** unless you explicitly say exactly:

> **"FIGMA is a GO!"**

No other phrase, assumption, or reasoning authorizes Figma use. Figma is reserved for
high-value visual review, polish passes, and explicit design checkpoints only.
The repo and browser output remain the source of truth.
