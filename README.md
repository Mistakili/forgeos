# ForgeOS

The operating system that learns your organization before it starts working for it.

## Quick Start

```bash
git clone https://github.com/mistakili/forgeos.git
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

- **Compiler**: Evidence → Facts → Claims → Genome
- **Runtime**: Mission → Reasoning → Conflict Resolution → Execution
- **Kernel**: Event Store, Artifact Store, Scheduler, Pipeline Registry

## Requirements

- Python 3.8+
- Rich (for console UI)

```bash
pip install rich
```

## Next Steps

- Connect real Qwen Cloud API key for reasoning
- Add connectors (website crawler, PDF parser, etc.)
- Polish the React UI

## License

MIT