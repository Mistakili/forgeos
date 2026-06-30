from __future__ import annotations

import json
from typing import Any

from reasoning.client import ReasoningClient


async def build_insights(
    compiled: dict[str, Any],
    coverage: dict[str, Any],
    radar: list[dict[str, Any]],
    reasoning: ReasoningClient | None = None,
) -> list[dict[str, str]]:
    """Three surprising insights — the demo 'aha' moment."""
    genome = compiled.get("genome", {})
    facts = compiled.get("facts", [])
    evidence = compiled.get("evidence", [])

    if reasoning and reasoning.is_live:
        live = await _insights_from_llm(compiled, coverage, reasoning)
        if live and len(live) >= 2:
            return live[:3]

    return _insights_from_evidence(genome, facts, evidence, coverage, radar)


async def _insights_from_llm(
    compiled: dict[str, Any],
    coverage: dict[str, Any],
    reasoning: ReasoningClient,
) -> list[dict[str, str]]:
    genome = compiled.get("genome", {})
    facts = "\n".join(f"- {f.get('statement', '')}" for f in compiled.get("facts", [])[:12])
    missing = [
        i["label"] for i in coverage.get("items", []) if i.get("available") and not i.get("connected")
    ]

    prompt = (
        f"Organization genome: {json.dumps(genome, indent=2)}\n\n"
        f"Facts:\n{facts}\n\n"
        f"Unconnected sources: {', '.join(missing) or 'none'}\n\n"
        "Generate exactly 3 non-obvious operational insights about this organization. "
        "Each should feel like something a founder might not have articulated. "
        "Respond as JSON array: "
        '[{"title": "short label", "body": "one specific sentence"}]'
    )

    result = await reasoning.complete_json(prompt, fallback=None, task="claim_inference")
    if isinstance(result, list):
        insights = []
        for i, item in enumerate(result[:3]):
            if isinstance(item, dict) and item.get("body"):
                insights.append(
                    {
                        "title": item.get("title", f"Insight #{i + 1}"),
                        "body": item["body"],
                    }
                )
        return insights
    return []


def _insights_from_evidence(
    genome: dict[str, Any],
    facts: list[dict[str, Any]],
    evidence: list[dict[str, Any]],
    coverage: dict[str, Any],
    radar: list[dict[str, Any]],
) -> list[dict[str, str]]:
    identity = genome.get("identity", "This organization")
    voice = genome.get("voice", "neutral")
    audience = genome.get("audience", "general customers")
    channels = genome.get("channels", [])

    missing = [
        i["label"] for i in coverage.get("items", []) if i.get("available") and not i.get("connected")
    ]
    weak = sorted([r for r in radar if r.get("status") != "strong"], key=lambda x: x.get("score", 0))

    has_website = any(e.get("source_type") == "website" for e in evidence)
    has_social = any(e.get("source_type") == "social" for e in evidence)

    insights: list[dict[str, str]] = []

    if has_website and has_social:
        insights.append(
            {
                "title": "Channel positioning tension",
                "body": (
                    f"The website positions {identity} with a {voice} voice for "
                    f"{audience}, while social channels may speak to a different segment — "
                    "campaigns should reconcile this before spend."
                ),
            }
        )
    elif has_website:
        insights.append(
            {
                "title": "Single-source genome",
                "body": (
                    f"Identity '{identity}' is inferred entirely from the website. "
                    "Social and document connectors would sharpen audience and channel claims."
                ),
            }
        )

    if missing:
        insights.append(
            {
                "title": "Evidence blind spot",
                "body": (
                    f"Genome compiled without {', '.join(missing[:3])}. "
                    "Operational decisions in those domains rely on inference, not verified sources."
                ),
            }
        )

    if weak:
        dept = weak[0].get("dept", "Operations")
        score = weak[0].get("score", 0)
        insights.append(
            {
                "title": "Approval chain risk",
                "body": (
                    f"{dept} coverage is only {score}% — policy and approval rules "
                    "in this area are under-specified in available evidence."
                ),
            }
        )

    messaging_facts = [f for f in facts if f.get("category") == "messaging"]
    if messaging_facts:
        sample = messaging_facts[0].get("statement", "").replace("Key message: ", "")
        insights.append(
            {
                "title": "Messaging through-line",
                "body": (
                    f"Public messaging emphasizes '{sample[:80]}' — "
                    "missions should align deliverables to this thread for brand coherence."
                ),
            }
        )

    # Deduplicate by title and take top 3
    seen: set[str] = set()
    unique: list[dict[str, str]] = []
    for item in insights:
        if item["title"] not in seen:
            seen.add(item["title"])
            unique.append(item)

    while len(unique) < 3:
        n = len(unique) + 1
        unique.append(
            {
                "title": f"Compiler observation #{n}",
                "body": (
                    f"Genome confidence at {int(genome.get('confidence', 0.5) * 100)}% "
                    f"with {coverage.get('coverage_percent', 0)}% source coverage — "
                    "connect more sources to raise decision fidelity."
                ),
            }
        )

    return unique[:3]