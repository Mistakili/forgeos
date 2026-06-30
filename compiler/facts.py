from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
from uuid import uuid4


@dataclass
class Fact:
    """Structured observation extracted from evidence."""

    id: str = field(default_factory=lambda: f"fact-{uuid4().hex[:8]}")
    evidence_id: str = ""
    category: str = ""
    statement: str = ""
    confidence: float = 0.0
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "evidence_id": self.evidence_id,
            "category": self.category,
            "statement": self.statement,
            "confidence": self.confidence,
            "metadata": self.metadata,
        }