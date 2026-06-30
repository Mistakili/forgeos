from __future__ import annotations

import os
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class ProviderConfig:
    name: str
    model: str
    configured: bool


class BaseProvider(ABC):
    """Adapter for a single AI provider."""

    name: str = "base"

    @property
    @abstractmethod
    def is_configured(self) -> bool:
        """Whether this provider has credentials and can be used."""

    @property
    def model(self) -> str:
        return "unknown"

    @abstractmethod
    async def complete(self, prompt: str, system: str = "") -> str:
        """Return model text completion."""

    def to_config(self) -> ProviderConfig:
        return ProviderConfig(
            name=self.name,
            model=self.model,
            configured=self.is_configured,
        )


def env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()