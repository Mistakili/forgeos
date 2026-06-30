from __future__ import annotations

from typing import Any

# Full org source catalog — connectors marked when implemented
SOURCE_CATALOG: list[dict[str, Any]] = [
    {"id": "website", "label": "Website", "type": "website", "available": True},
    {"id": "documents", "label": "Documents", "type": "pdf", "available": True},
    {"id": "social", "label": "Social", "type": "social", "available": True},
    {"id": "notion", "label": "Notion", "type": "notion", "available": False},
    {"id": "hubspot", "label": "HubSpot", "type": "hubspot", "available": False},
    {"id": "slack", "label": "Slack", "type": "slack", "available": False},
    {"id": "policies", "label": "Policies", "type": "policies", "available": False},
]


def build_coverage(sources: list[dict[str, str]]) -> dict[str, Any]:
    """Explain genome confidence via source coverage."""
    connected_types = {s["type"] for s in sources if s.get("source", "").strip()}
    items = []
    connected_count = 0

    for entry in SOURCE_CATALOG:
        is_connected = entry["type"] in connected_types and entry["available"]
        if is_connected:
            connected_count += 1
        items.append(
            {
                "id": entry["id"],
                "label": entry["label"],
                "connected": is_connected,
                "available": entry["available"],
            }
        )

    available_total = sum(1 for e in SOURCE_CATALOG if e["available"])
    coverage_pct = round((connected_count / available_total) * 100) if available_total else 0

    return {
        "items": items,
        "connected": connected_count,
        "available": available_total,
        "coverage_percent": coverage_pct,
        "hint": _coverage_hint(items),
    }


def _coverage_hint(items: list[dict[str, Any]]) -> str:
    missing = [i["label"] for i in items if i["available"] and not i["connected"]]
    if not missing:
        return "Full coverage on available connectors."
    return f"Connect {', '.join(missing[:3])} to improve genome confidence."