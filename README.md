# ForgeOS

**ForgeOS is an Organization Compiler.**

It continuously compiles an organization's digital footprint into an executable operational model that humans and AI systems can reason over.

> **Today's AI understands the world.**
>
> **ForgeOS understands your organization.**

It compiles your company's websites, documents, social channels, and operational knowledge into a living **Organization Genome** — a structured model that missions, agents, and workflows can run on.

---

## What is it?

ForgeOS is infrastructure for AI-native organizations. Not another chatbot wrapper. Not a generic agent framework.

It takes scattered organizational signals — web presence, documents, social profiles, and more — and compiles them into a traceable, replayable **Organization Genome**: identity, voice, audience, channels, and claims backed by evidence.

## Why does it exist?

Most AI tools answer questions about the world. They don't understand *your* company.

When you ask ChatGPT to write a campaign, it guesses your brand. When you ask it to scope a project, it invents your constraints. Every session starts from zero.

ForgeOS starts from your organization. It discovers sources, compiles facts, infers claims, and produces a genome you can execute missions against — with a full audit trail from evidence to decision.

## How does it work?

```
Sources
  │
  ▼
Organization Compiler
  │
  ▼
Organization Genome
  │
  ▼
Forge Runtime
  │
  ▼
Execution
  │
  ▼
Continuous Learning
```

Under the hood, the compiler runs a four-stage pipeline:

**Evidence → Facts → Claims → Genome**

The runtime takes missions against that genome — deliberation, workforce assembly, execution — and records every step in an event store for replay.

---

## Why not just use ChatGPT?

| | ChatGPT | ForgeOS |
|---|---|---|
| **Knows your org** | Only what you paste in the prompt | Compiled from your actual sources |
| **Traceable** | Black box | Evidence → Facts → Claims → Genome |
| **Persistent** | Resets every session | Genome stored, missions replayable |
| **Executable** | Returns text | Runs missions with structured output |
| **Purpose** | Answers questions | Understands, then operates |

ChatGPT answers questions. **ForgeOS first understands the company.**

---

## Quick Start

Under five minutes:

```bash
git clone https://github.com/Mistakili/forgeos.git
cd forgeos
pip install -r requirements.txt
python demo.py
```

You'll see the full flow: boot sequence → genome compilation → workforce assembly → board deliberation → executive minutes.

### Production deploy (one command)

```bash
cp .env.example .env
# Add any API key below (OpenAI, Anthropic, Qwen, etc.)
docker compose up --build -d
```

Open **http://localhost:8000** — API + dashboard, single port.

### Bring Your Own Model (BYOM)

ForgeOS is **model-agnostic**. The model is below the runtime, not the product.

```bash
cp .env.example .env
# Add ANY one of these:
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DASHSCOPE_API_KEY=...        # Qwen
GOOGLE_API_KEY=...           # Gemini
GROQ_API_KEY=...
OPENROUTER_API_KEY=...
OLLAMA_ENABLED=true            # Local/private
```

The **Model Router** picks the best configured provider per task:

| Task | Preferred models |
|------|-----------------|
| Claim inference | Fast/cheap (GPT-4o-mini, Qwen, Groq) |
| Board deliberation | High-quality (Claude, GPT-4) |
| Executive summary | Fast/cheap |

Pin a provider: `FORGE_DEFAULT_PROVIDER=anthropic`

Without any key, ForgeOS runs in **mock mode** — the full pipeline works, reasoning uses deterministic fallbacks.

### Development UI (hot reload)

```bash
# Terminal 1
python -m api.server

# Terminal 2
cd ui && npm install && npm run dev
```

Open http://localhost:5173

### Cost model

Compile once, reuse thousands of times:

- **Initial compilation**: ~$5–$50 AI cost for a typical SMB
- **Incremental updates**: cents per new document
- **Per mission**: often pennies (queries genome, not raw docs)

See [ROADMAP.md](ROADMAP.md) for the full cost architecture.

---

## Connectors

| Connector | Usage |
|-----------|-------|
| Website | `{"type": "website", "source": "example.com"}` |
| PDF | `{"type": "pdf", "source": "path/to/doc.pdf"}` |
| Social | `{"type": "social", "source": "instagram:handle"}` |

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | System status |
| GET | `/api/models` | Configured AI providers (BYOM) |
| POST | `/api/discover` | Collect evidence from sources |
| POST | `/api/compile` | Run the compiler pipeline |
| POST | `/api/mission` | Full mission flow |
| GET | `/api/missions/{id}` | Replay a mission |

## Roadmap

See [ROADMAP.md](ROADMAP.md) for current progress and what's next.

## Requirements

- Python 3.8+
- Node.js 18+ (for the web UI only)

## License

MIT