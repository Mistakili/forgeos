"""Unified reasoning client — use this instead of provider-specific clients."""

from __future__ import annotations

from typing import Any

from reasoning.router import ModelRouter


class ReasoningClient:
    """Model-agnostic reasoning interface for compiler and runtime."""

    def __init__(self, router: ModelRouter | None = None) -> None:
        self.router = router or ModelRouter()

    @property
    def is_live(self) -> bool:
        return self.router.is_live

    def list_providers(self) -> list[dict[str, Any]]:
        return [
            {"name": c.name, "model": c.model, "configured": c.configured}
            for c in self.router.list_providers()
        ]

    async def complete(self, prompt: str, task: str = "claim_inference", system: str = "") -> str:
        text, _ = await self.router.complete(prompt, task=task, system=system)
        return text

    async def complete_json(
        self,
        prompt: str,
        fallback: Any = None,
        task: str = "claim_inference",
        system: str = "Respond with valid JSON only.",
    ) -> Any:
        result, _ = await self.router.complete_json(
            prompt, fallback=fallback, task=task, system=system
        )
        return result

    async def deliberate(self, objective: str, genome: dict[str, Any]) -> dict[str, Any]:
        return await self.router.deliberate(objective, genome)