# Memory Strategy — Mad Labs Website

## Bank Isolation

This project uses a **fully isolated** Hindsight memory ecosystem to prevent any cross-contamination with other projects (Quantmap, etc.).

### Bank Identity

| Property | Value |
|----------|-------|
| **Bank ID** | `mad-labs-website` |
| **Hindsight Profile** | `mad-labs-website` |
| **Daemon Port** | `9180` |
| **Memory Mode** | `hybrid` (semantic + keyword) |
| **Database Instance** | Separate PostgreSQL instance via `hindsight-embed-mad-labs-website` |

### Isolation Rules

1. **This bank contains ONLY Mad Labs Website memories.** No Quantmap facts, no cross-project references.
2. **The Quantmap project uses bank `hermes` (profile `hermes`, port `9177`).** These are completely separate daemon processes with separate databases.
3. **Cross-project recall is not allowed.** Hermes sessions for this project must never query the `hermes` bank, and vice versa.
4. **Skills from other projects must not be loaded** in Mad Labs sessions (see `.hermes.md`).

## How Isolation Works

Each Hindsight profile runs its own daemon process with its own:

- PostgreSQL database (stored in a separate instance directory)
- Embedding indexes
- Memory units and entities
- Retention configuration and tags

When you launch `hindsight-embed -p mad-labs-website daemon start`, the daemon starts on port 9180 using the `mad-labs-website` profile. All memory operations (`retain`, `recall`, `reflect`) automatically target the `mad-labs-website` bank within this isolated database.

## Hermes Integration

Hermes Agent connects to Hindsight via the `memory` provider. The provider reads config from `~/.hermes/hindsight/config.json`. For this project, the Hermes Agent will be started or configured to use profile `mad-labs-website`.

### Starting Hindsight for Mad Labs

```bash
hindsight-embed -p mad-labs-website daemon start
```

### Verifying Isolation

```bash
# List banks in Mad Labs profile (should show only mad-labs-website)
hindsight-embed -p mad-labs-website bank list

# List banks in Quantmap profile (should show only hermes)
hindsight-embed -p hermes bank list
```

## Configuration Details

The `mad-labs-website` Hindsight profile was created with:

```env
HINDSIGHT_API_LLM_PROVIDER=openai
HINDSIGHT_API_LLM_API_KEY=local-not-needed
HINDSIGHT_API_LLM_MODEL=qwen3-mem
HINDSIGHT_API_LLM_BASE_URL=http://127.0.0.1:1234/v1
HINDSIGHT_API_LOG_LEVEL=info
HINDSIGHT_EMBED_DAEMON_IDLE_TIMEOUT=300
```

`memory_mode=hybrid` enables both semantic (vector) and keyword-based recall for best retrieval quality.
