from __future__ import annotations

from typing import Any


def build_department_radar(
    sources: list[dict[str, str]],
    compiled: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Department coverage radar — what ForgeOS knows vs gaps."""
    types = {s["type"] for s in sources if s.get("source", "").strip()}
    evidence_count = len((compiled or {}).get("evidence", []))
    fact_count = len((compiled or {}).get("facts", []))
    boost = min(15, evidence_count * 4 + fact_count)

    def score(base: int, *req_types: str) -> int:
        if any(t in types for t in req_types):
            return min(98, base + boost)
        return max(8, base - 35)

    departments = [
        {"dept": "Marketing", "score": score(88, "social", "website"), "axis": "top"},
        {"dept": "Sales", "score": score(82, "website"), "axis": "right"},
        {"dept": "Operations", "score": score(72, "pdf"), "axis": "bottom-right"},
        {"dept": "Legal", "score": score(68, "pdf", "policies"), "axis": "bottom-left"},
        {"dept": "Finance", "score": score(55, "website", "pdf"), "axis": "left"},
    ]

    for d in departments:
        s = d["score"]
        if s >= 75:
            d["status"] = "strong"
        elif s >= 40:
            d["status"] = "partial"
        else:
            d["status"] = "gap"

    return departments