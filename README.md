# MAD LABS Website

The official website for **MAD LABS** — a design and engineering studio.

## Project Structure

```
mad-labs-website/
├── src/
│   ├── pages/        # Site pages and routes
│   ├── assets/       # Images, fonts, media
│   ├── styles/       # CSS, design tokens
│   └── functions/    # Cloudflare Pages Functions (serverless)
├── docs/             # Project documentation, strategy, decisions
├── .hermes.md        # Hermes Agent project configuration
├── .gitignore
└── README.md
```

## Tech Stack

- Cloudflare Pages (hosting + serverless functions)
- (Frontend framework TBD)

## Getting Started

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build
```

## Memory & Context

This project uses a **dedicated Hindsight memory bank** to isolate it from all other projects (Quantmap, etc.). See [docs/memory-strategy.md](docs/memory-strategy.md) for details.
