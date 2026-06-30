from __future__ import annotations

from typing import Any


def build_board_trace(
    compiled: dict[str, Any],
    objective: str,
    board_decision: dict[str, Any],
    coverage: dict[str, Any],
) -> dict[str, Any]:
    """Traceable board decision linked to evidence and genome."""
    evidence = [
        {
            "source": e.get("source", "unknown"),
            "type": e.get("source_type", ""),
            "summary": (e.get("metadata") or {}).get("title")
            or e.get("content", "")[:80],
        }
        for e in compiled.get("evidence", [])
    ]

    facts = [f.get("statement", "") for f in compiled.get("facts", [])[:5]]
    genome = compiled.get("genome", {})

    reasoning = board_decision.get("reasoning_points") or [
        f"Objective aligns with genome identity: {genome.get('identity', 'unknown')}",
        f"Voice profile ({genome.get('voice', 'neutral')}) supports campaign tone",
        f"Coverage at {coverage.get('coverage_percent', 0)}% across org sources",
        board_decision.get("rationale", "Genome confidence supports execution"),
    ]

    genome_conf = float(genome.get("confidence", 0.5))
    coverage_factor = coverage.get("coverage_percent", 0) / 100
    decision_confidence = round(min(0.95, genome_conf * 0.6 + coverage_factor * 0.4), 2)

    return {
        "decision": board_decision.get("decision", "Pending"),
        "objective": objective,
        "evidence": evidence,
        "facts": facts,
        "reasoning": reasoning if isinstance(reasoning, list) else [str(reasoning)],
        "confidence": decision_confidence,
        "rationale": board_decision.get("rationale", ""),
        "next_steps": board_decision.get("next_steps", []),
        "policies": _policy_refs(compiled),
    }


def _policy_refs(compiled: dict[str, Any]) -> list[str]:
    refs = []
    for claim in compiled.get("claims", []):
        if claim.get("attribute") in ("compliance", "policy", "policies"):
            refs.append(claim.get("value", ""))
    if not refs:
        refs.append("No policy connector — compliance review recommended")
    return refs


def format_replay_timeline(events: list[dict[str, Any]]) -> list[dict[str, str]]:
    """Human-readable mission replay like git history."""
    labels = {
        "compile.started": "Compilation started",
        "evidence.collected": "Evidence collected",
        "facts.extracted": "Facts extracted",
        "claims.generated": "Claims generated",
        "genome.compiled": "Genome compiled",
        "compile.completed": "Compilation complete",
        "mission.started": "Mission started",
        "board.deliberated": "Board deliberation",
        "board.decided": "Decision recorded",
        "mission.completed": "Mission completed",
        "discovery.complete": "Sources discovered",
    }

    timeline = []
    for event in events:
        event_type = event.get("type", "")
        payload = event.get("payload", {})
        label = labels.get(event_type, event_type.replace(".", " ").title())
        detail = ""
        if event_type == "evidence.collected":
            detail = f"{payload.get('count', 0)} sources"
        elif event_type == "genome.compiled":
            detail = f"{int(float(payload.get('confidence', 0)) * 100)}% confidence"
        elif event_type == "board.decided":
            detail = payload.get("decision", "")
        elif event_type == "mission.started":
            detail = payload.get("objective", "")

        timeline.append(
            {
                "time": event.get("timestamp", ""),
                "label": label,
                "detail": detail,
                "type": event_type,
            }
        )
    return timeline