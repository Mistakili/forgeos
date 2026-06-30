from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
from uuid import uuid4


@dataclass
class OrganizationGenome:
    """Compiled organizational DNA from claims."""

    id: str = field(default_factory=lambda: f"genome-{uuid4().hex[:8]}")
    identity: str = ""
    voice: str = ""
    audience: str = ""
    channels: list[str] = field(default_factory=list)
    values: list[str] = field(default_factory=list)
    claims: list[dict[str, Any]] = field(default_factory=list)
    confidence: float = 0.0
    compiled_at: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "identity": self.identity,
            "voice": self.voice,
            "audience": self.audience,
            "channels": self.channels,
            "values": self.values,
            "claims": self.claims,
            "confidence": self.confidence,
            "compiled_at": self.compiled_at,
        }