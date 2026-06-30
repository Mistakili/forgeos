# ForgeOS Roadmap

ForgeOS is the first **Organization Compiler** — infrastructure that turns organizational signals into executable models.

**Core platform is production-ready.** Deploy with Docker, connect your own AI keys, run missions end-to-end.

---

## Shipped (production-ready)

| Status | Item | Notes |
|--------|------|-------|
| ✓ | **Kernel** | Event store and artifact store for mission replay |
| ✓ | **Compiler contracts** | Evidence, Facts, Claims, Genome type system |
| ✓ | **Genome Compiler v1** | Full Evidence → Facts → Claims → Genome pipeline |
| ✓ | **Runtime** | Mission orchestration with board deliberation |
| ✓ | **Connectors** | Website crawler, PDF parser, social profiles |
| ✓ | **Model Router (BYOM)** | OpenAI, Anthropic, Qwen, Google, Groq, OpenRouter, Ollama |
| ✓ | **REST API** | discover, compile, mission, models, health |
| ✓ | **Web dashboard** | React mission control UI |
| ✓ | **Production deploy** | Docker + docker-compose, single-port serving |
| ✓ | **CLI demo** | `python demo.py` |

## In progress

| Status | Item | Notes |
|--------|------|-------|
| ◐ | **Evidence graph** | Pipeline connected; graph database not yet |
| ◐ | **Incremental recompilation** | Full recompile today; patch-based updates next |
| ◐ | **Model benchmarking** | Router picks by task; cost/quality dashboard next |

## Planned

| Status | Item | Notes |
|--------|------|-------|
| ⬜ | **Policy engine** | Org-level rules, approvals, guardrails |
| ⬜ | **Continuous learning** | Feed execution results back into genome |
| ⬜ | **CRM connectors** | HubSpot, Salesforce |
| ⬜ | **Document stores** | Google Drive, Notion, SharePoint |
| ⬜ | **Communication channels** | Slack, email archives |
| ⬜ | **Enterprise integrations** | SSO, audit logging, data residency |
| ⬜ | **Genome explorer** | Visual browse of evidence → claims chain |
| ⬜ | **Mission replay UI** | Timeline view of event store |

---

## Cost architecture

ForgeOS is built like a **compiler**, not a chatbot:

```
Compile once (expensive, infrequent)  →  Genome (cheap, reusable)  →  Runtime (pennies per mission)
```

| Phase | Typical cost | Frequency |
|-------|-------------|-----------|
| Initial compilation | $5–$50 AI cost (SMB) | Once |
| Incremental update | $0.01–$0.10 | Per new document |
| Mission execution | <$0.10 (often pennies) | Per mission |

**80% deterministic** (Python, rules, graphs) · **20% LLM** (reasoning only)

Use small/fast models for extraction, large models only for board deliberation. BYOM lets you control cost directly.

---

## Legend

- **✓** Shipped and production-ready
- **◐** In progress
- **⬜** Planned

*Need a connector? [Open an issue](https://github.com/Mistakili/forgeos/issues).*