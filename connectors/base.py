from __future__ import annotations

from abc import ABC, abstractmethod

from compiler.evidence import Evidence


class BaseConnector(ABC):
    """Base class for evidence collectors."""

    source_type: str = "unknown"

    @abstractmethod
    async def collect(self, source: str) -> Evidence:
        """Collect evidence from a source."""