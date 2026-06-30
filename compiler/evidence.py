from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


@dataclass
class Evidence:
    """Raw artifact collected from a connector."""

    id: str = field(default_factory=lambda: f"ev-{uuid4().hex[:8]}")
    source: str = ""
    source_type: str = ""
    content: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)
    collected_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "source": self.source,
            "source_type": self.source_type,
            "content": self.content[:500],
            "content_length": len(self.content),
            "metadata": self.metadata,
            "collected_at": self.collected_at,
        }