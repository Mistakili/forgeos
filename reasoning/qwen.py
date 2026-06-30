from __future__ import annotations

import json
import os
import re
from typing import Any


class QwenClient:
    """Qwen Cloud (DashScope) client with mock fallback."""

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str | None = None,
        model: str | None = None,
    ) -> None:
        self.api_key = api_key or os.getenv("DASHSCOPE_API_KEY", "")
        self.base_url = base_url or os.getenv(
            "QWEN_BASE_URL",
            "https://dashscope.aliyuncs.com/compatible-mode/v1",
        )
        self.model = model or os.getenv("QWEN_MODEL", "qwen-plus")

    @property
    def is_live(self) -> bool:
        return bool(self.api_key)

    async def complete(self, prompt: str, system: str = "") -> str:
        if not self.is_live:
            return ""

        try:
            import httpx

            messages = []
            if system:
                messages.append({"role": "system", "content": system})
            messages.append({"role": "user", "content": prompt})

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": 0.3,
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception:
            return ""

    async def complete_json(
        self,
        prompt: str,
        fallback: Any = None,
        system: str = "Respond with valid JSON only.",
    ) -> Any:
        raw = await self.complete(prompt, system=system)
        if not raw:
            return fallback

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            match = re.search(r"\[[\s\S]*\]|\{[\s\S]*\}", raw)
            if match:
                try:
                    return json.loads(match.group())
                except json.JSONDecodeError:
                    pass
        return fallback

    async def deliberate(self, objective: str, genome: dict[str, Any]) -> dict[str, Any]:
        prompt = (
            f"Mission objective: {objective}\n\n"
            f"Organization genome: {json.dumps(genome, indent=2)}\n\n"
            "As an executive board, decide: approve MVP scope, defer, or reject. "
            "Respond as JSON: "
            '{"decision": "...", "rationale": "...", "next_steps": ["..."]}'
        )
        fallback = {
            "decision": "Scoped MVP approved",
            "rationale": "Genome confidence supports a focused launch campaign.",
            "next_steps": [
                "Draft listing copy aligned to brand voice",
                "Schedule social campaign across active channels",
                "Review compliance before publish",
            ],
        }
        result = await self.complete_json(prompt, fallback=fallback)
        if isinstance(result, dict):
            return result
        return fallback