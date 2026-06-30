from __future__ import annotations

import json
import os
import re
from typing import Any

from reasoning.providers import build_providers
from reasoning.providers.base import BaseProvider, ProviderConfig


# Task → preferred provider order (first configured wins)
TASK_ROUTES: dict[str, list[str]] = {
    "claim_inference": ["openai", "qwen", "anthropic", "groq", "openrouter", "google", "ollama"],
    "board_deliberation": ["anthropic", "openai", "qwen", "openrouter", "google", "groq", "ollama"],
    "executive_summary": ["openai", "groq", "qwen", "anthropic", "ollama"],
}


class ModelRouter:
    """Routes reasoning tasks to the best available provider (BYOM)."""

    def __init__(self, providers: list[BaseProvider] | None = None) -> None:
        self._providers = providers or build_providers()
        self._by_name = {p.name: p for p in self._providers}
        self._default = os.getenv("FORGE_DEFAULT_PROVIDER", "").strip().lower()
        self._force_mock = os.getenv("FORGE_REASONING_MODE", "auto").lower() == "mock"

    @property
    def is_live(self) -> bool:
        if self._force_mock:
            return False
        return any(p.is_configured for p in self._providers)

    def list_providers(self) -> list[ProviderConfig]:
        return [p.to_config() for p in self._providers]

    def _resolve(self, task: str) -> BaseProvider | None:
        if self._force_mock:
            return None

        if self._default and self._default in self._by_name:
            preferred = self._by_name[self._default]
            if preferred.is_configured:
                return preferred

        for name in TASK_ROUTES.get(task, []):
            provider = self._by_name.get(name)
            if provider and provider.is_configured:
                return provider

        for provider in self._providers:
            if provider.is_configured:
                return provider

        return None

    async def complete(
        self,
        prompt: str,
        task: str = "claim_inference",
        system: str = "",
    ) -> tuple[str, str | None]:
        """Returns (response_text, provider_name)."""
        provider = self._resolve(task)
        if not provider:
            return "", None
        result = await provider.complete(prompt, system=system)
        return result, provider.name

    async def complete_json(
        self,
        prompt: str,
        fallback: Any = None,
        task: str = "claim_inference",
        system: str = "Respond with valid JSON only.",
    ) -> tuple[Any, str | None]:
        raw, provider = await self.complete(prompt, task=task, system=system)
        if not raw:
            return fallback, None

        try:
            return json.loads(raw), provider
        except json.JSONDecodeError:
            match = re.search(r"\[[\s\S]*\]|\{[\s\S]*\}", raw)
            if match:
                try:
                    return json.loads(match.group()), provider
                except json.JSONDecodeError:
                    pass
        return fallback, provider

    async def deliberate(self, objective: str, genome: dict[str, Any]) -> dict[str, Any]:
        prompt = (
            f"Mission objective: {objective}\n\n"
            f"Organization genome: {json.dumps(genome, indent=2)}\n\n"
            "As an executive board, decide: approve MVP scope, defer, or reject. "
            "Respond as JSON: "
            '{"decision": "...", "rationale": "...", "next_steps": ["..."]}'
        )
        fallback = {
            "decision": "Approve campaign",
            "rationale": "Genome confidence supports a focused launch campaign.",
            "reasoning_points": [
                "Marketing alignment confirmed against genome voice profile",
                "Compliance risk assessed as low pending policy connector",
                "Budget scope fits workforce assembly plan",
            ],
            "next_steps": [
                "Draft listing copy aligned to brand voice",
                "Schedule social campaign across active channels",
                "Review compliance before publish",
            ],
        }
        result, provider = await self.complete_json(
            prompt, fallback=fallback, task="board_deliberation"
        )
        if isinstance(result, dict):
            result["_provider"] = provider
            return result
        fallback["_provider"] = provider
        return fallback