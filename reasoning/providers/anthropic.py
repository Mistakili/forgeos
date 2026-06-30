from __future__ import annotations

from reasoning.providers.base import BaseProvider, env


class AnthropicProvider(BaseProvider):
    """Anthropic Claude API."""

    name = "anthropic"

    @property
    def api_key(self) -> str:
        return env("ANTHROPIC_API_KEY")

    @property
    def model(self) -> str:
        return env("ANTHROPIC_MODEL", "claude-3-5-haiku-20241022")

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    async def complete(self, prompt: str, system: str = "") -> str:
        if not self.is_configured:
            return ""

        try:
            import httpx

            payload: dict = {
                "model": self.model,
                "max_tokens": 4096,
                "messages": [{"role": "user", "content": prompt}],
            }
            if system:
                payload["system"] = system

            async with httpx.AsyncClient(timeout=90.0) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": self.api_key,
                        "anthropic-version": "2023-06-01",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                blocks = data.get("content", [])
                return "".join(
                    b.get("text", "") for b in blocks if b.get("type") == "text"
                )
        except Exception:
            return ""