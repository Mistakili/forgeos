from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
from uuid import uuid4


@dataclass
class Claim:
    """Inferred organizational attribute supported by facts."""

    id: str = field(default_factory=lambda: f"claim-{uuid4().hex[:8]}")
    attribute: str = ""
    value: str = ""
    supporting_facts: list[str] = field(default_factory=list)
    confidence: float = 0.0
    reasoning: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "attribute": self.attribute,
            "value": self.value,
            "supporting_facts": self.supporting_facts,
            "confidence": self.confidence,
            "reasoning": self.reasoning,
        }