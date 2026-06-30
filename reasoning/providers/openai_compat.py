from __future__ import annotations

from reasoning.providers.base import BaseProvider, env


class OpenAICompatProvider(BaseProvider):
    """OpenAI-compatible API (OpenAI, Qwen, Groq, OpenRouter, Ollama, Google)."""

    def __init__(
        self,
        name: str,
        api_key_env: str,
        base_url_env: str,
        default_base_url: str,
        model_env: str,
        default_model: str,
        api_key_optional: bool = False,
    ) -> None:
        self.name = name
        self._api_key_env = api_key_env
        self._base_url_env = base_url_env
        self._default_base_url = default_base_url
        self._model_env = model_env
        self._default_model = default_model
        self._api_key_optional = api_key_optional

    @property
    def api_key(self) -> str:
        return env(self._api_key_env)

    @property
    def base_url(self) -> str:
        return env(self._base_url_env, self._default_base_url)

    @property
    def model(self) -> str:
        return env(self._model_env, self._default_model)

    @property
    def is_configured(self) -> bool:
        if self._api_key_optional:
            enabled = env("OLLAMA_ENABLED").lower() in ("1", "true", "yes")
            custom_url = env(self._base_url_env)
            return enabled or bool(custom_url)
        return bool(self.api_key)

    async def complete(self, prompt: str, system: str = "") -> str:
        if not self.is_configured:
            return ""

        try:
            import httpx

            messages: list[dict[str, str]] = []
            if system:
                messages.append({"role": "system", "content": system})
            messages.append({"role": "user", "content": prompt})

            headers = {"Content-Type": "application/json"}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"

            async with httpx.AsyncClient(timeout=90.0) as client:
                response = await client.post(
                    f"{self.base_url.rstrip('/')}/chat/completions",
                    headers=headers,
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