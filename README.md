# ForgeOS

The operating system that learns your organization before it starts working for it.

## Quick Start

```bash
git clone https://github.com/Mistakili/forgeos.git
cd forgeos
pip install -r requirements.txt
python demo.py
```

## What It Does

ForgeOS connects to your organization's digital footprint (website, documents, socials, etc.), compiles it into an **Organization Genome**, assembles a digital workforce, and runs missions with traceable reasoning.

### Demo Flow

1. **Boot Sequence** (Discovery)
2. **Organization Genome** (Understanding)
3. **Workforce Assembly** (Activation)
4. **Board Meeting** (Deliberation)
5. **Executive Minutes** (Closure)

## Architecture

```
Connectors          Compiler Pipeline           Runtime
──────────          ─────────────────           ───────
Website  ──┐        Evidence                    Mission
PDF      ──┼──►     Facts      ──► Claims ──►   Board Meeting
Social   ──┘        Genome                      Workforce
                         ▲
                    Qwen API (reasoning)
```

- **Compiler**: Evidence → Facts → Claims → Genome
- **Runtime**: Mission → Reasoning → Conflict Resolution → Execution
- **Kernel**: Event Store, Artifact Store

## Connectors

| Connector | Usage |
|-----------|-------|
| Website | `{"type": "website", "source": "example.com"}` |
| PDF | `{"type": "pdf", "source": "path/to/doc.pdf"}` |
| Social | `{"type": "social", "source": "instagram:handle"}` |

## Qwen Cloud API

Copy `.env.example` to `.env` and add your DashScope API key:

```bash
cp .env.example .env
# Edit .env — set DASHSCOPE_API_KEY
```

Without a key, ForgeOS runs in **mock reasoning mode** (fully functional demo).

Get a key at: https://dashscope.console.aliyun.com/

## React UI

Terminal 1 — API:

```bash
python -m api.server
```

Terminal 2 — UI:

```bash
cd ui
npm install
npm run dev
```

Open http://localhost:5173

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | System status |
| POST | `/api/discover` | Collect evidence |
| POST | `/api/compile` | Run compiler pipeline |
| POST | `/api/mission` | Full mission flow |
| GET | `/api/missions/{id}` | Replay mission |

## Requirements

- Python 3.8+
- Node.js 18+ (for UI)

## License

MIT