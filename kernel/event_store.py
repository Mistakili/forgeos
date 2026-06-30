from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


class EventStore:
    """Append-only mission event log."""

    def __init__(self) -> None:
        self._events: list[dict[str, Any]] = []

    def append(self, event_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        event = {
            "id": f"evt-{uuid4().hex[:8]}",
            "type": event_type,
            "payload": payload,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._events.append(event)
        return event

    def list_events(self, mission_id: str | None = None) -> list[dict[str, Any]]:
        if not mission_id:
            return list(self._events)
        return [
            e
            for e in self._events
            if e.get("payload", {}).get("mission_id") == mission_id
        ]

    def replay(self, mission_id: str) -> list[dict[str, Any]]:
        return self.list_events(mission_id)

    def replay_session(self, session_id: str) -> list[dict[str, Any]]:
        return [
            e
            for e in self._events
            if e.get("payload", {}).get("session_id") == session_id
        ]