# ForgeOS Roadmap

ForgeOS is the first **Organization Compiler** — infrastructure that turns organizational signals into executable models.

This roadmap reflects honest progress as of the current release. Items marked **MVP** work in demos but aren't production-ready yet.

---

## Foundation

| Status | Item | Notes |
|--------|------|-------|
| ✓ | **Kernel** | Event store and artifact store for mission replay |
| ✓ | **Compiler contracts** | Evidence, Facts, Claims, Genome type system |
| ✓ | **Runtime scaffold** | `ForgeController` orchestrates discovery → compile → mission |
| ◐ | **Evidence graph** | Pipeline stages connected; full graph DB not yet |

## Compiler

| Status | Item | Notes |
|--------|------|-------|
| ◐ | **Genome Compiler v1** | Evidence → Facts → Claims → Genome works end-to-end |
| ◐ | **Qwen reasoning** | DashScope integration with mock fallback |
| ⬜ | **Incremental recompilation** | Re-compile when sources change |
| ⬜ | **Confidence calibration** | Validated confidence scores across claim types |
| ⬜ | **Conflict resolution** | Handle contradictory evidence across sources |

## Connectors

| Status | Item | Notes |
|--------|------|-------|
| ◐ | **Website crawler** | Fetches and extracts title, headings, content |
| ◐ | **PDF parser** | Extracts text from local PDF files |
| ◐ | **Social profiles** | Instagram, LinkedIn, Twitter handle parsing |
| ⬜ | **CRM connectors** | HubSpot, Salesforce |
| ⬜ | **Document stores** | Google Drive, Notion, SharePoint |
| ⬜ | **Communication channels** | Slack, email archives |
| ⬜ | **Enterprise integrations** | SSO, audit logging, data residency |

## Runtime

| Status | Item | Notes |
|--------|------|-------|
| ◐ | **Mission runtime** | Demo + API mission flow with board deliberation |
| ◐ | **Workforce assembly** | Role assignment from genome channels |
| ⬜ | **Live mission runtime** | Production-grade scheduling and execution |
| ⬜ | **Policy engine** | Org-level rules, approvals, guardrails |
| ⬜ | **Continuous learning** | Feed execution results back into the genome |

## Interface

| Status | Item | Notes |
|--------|------|-------|
| ◐ | **Web dashboard** | React mission control UI (MVP) |
| ◐ | **REST API** | FastAPI endpoints for discover, compile, mission |
| ✓ | **CLI demo** | Rich console demo (`python demo.py`) |
| ⬜ | **Genome explorer** | Browse evidence, facts, claims visually |
| ⬜ | **Mission replay UI** | Timeline view of event store |

---

## Legend

- **✓** Shipped and functional
- **◐** MVP — works in demos, not production-ready
- **⬜** Not started

## What we're optimizing for

1. **Understand before execute** — compile the org before running missions
2. **Traceability** — every claim links back to evidence
3. **Runnable in five minutes** — `git clone` → `python demo.py` always works
4. **Honest progress** — this file updates as things ship

---

*Have a connector or integration you need? [Open an issue](https://github.com/Mistakili/forgeos/issues).*