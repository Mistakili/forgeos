from __future__ import annotations

from typing import Any


class ArtifactStore:
    """In-memory store for compiled artifacts."""

    def __init__(self) -> None:
        self._artifacts: dict[str, dict[str, Any]] = {}

    def save(self, key: str, artifact: dict[str, Any]) -> None:
        self._artifacts[key] = artifact

    def get(self, key: str) -> dict[str, Any] | None:
        return self._artifacts.get(key)

    def list_keys(self) -> list[str]:
        return list(self._artifacts.keys())