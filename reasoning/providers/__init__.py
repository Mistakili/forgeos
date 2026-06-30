from reasoning.providers.anthropic import AnthropicProvider
from reasoning.providers.base import BaseProvider, ProviderConfig
from reasoning.providers.openai_compat import OpenAICompatProvider

__all__ = [
    "BaseProvider",
    "ProviderConfig",
    "OpenAICompatProvider",
    "AnthropicProvider",
    "build_providers",
]


def build_providers() -> list[BaseProvider]:
    """Instantiate all providers from environment variables."""
    providers: list[BaseProvider] = [
        OpenAICompatProvider(
            name="openai",
            api_key_env="OPENAI_API_KEY",
            base_url_env="OPENAI_BASE_URL",
            default_base_url="https://api.openai.com/v1",
            model_env="OPENAI_MODEL",
            default_model="gpt-4o-mini",
        ),
        AnthropicProvider(),
        OpenAICompatProvider(
            name="qwen",
            api_key_env="DASHSCOPE_API_KEY",
            base_url_env="QWEN_BASE_URL",
            default_base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
            model_env="QWEN_MODEL",
            default_model="qwen-plus",
        ),
        OpenAICompatProvider(
            name="groq",
            api_key_env="GROQ_API_KEY",
            base_url_env="GROQ_BASE_URL",
            default_base_url="https://api.groq.com/openai/v1",
            model_env="GROQ_MODEL",
            default_model="llama-3.1-8b-instant",
        ),
        OpenAICompatProvider(
            name="openrouter",
            api_key_env="OPENROUTER_API_KEY",
            base_url_env="OPENROUTER_BASE_URL",
            default_base_url="https://openrouter.ai/api/v1",
            model_env="OPENROUTER_MODEL",
            default_model="openai/gpt-4o-mini",
        ),
        OpenAICompatProvider(
            name="ollama",
            api_key_env="OLLAMA_API_KEY",
            base_url_env="OLLAMA_BASE_URL",
            default_base_url="http://localhost:11434/v1",
            model_env="OLLAMA_MODEL",
            default_model="llama3.2",
            api_key_optional=True,
        ),
        OpenAICompatProvider(
            name="google",
            api_key_env="GOOGLE_API_KEY",
            base_url_env="GOOGLE_BASE_URL",
            default_base_url="https://generativelanguage.googleapis.com/v1beta/openai",
            model_env="GOOGLE_MODEL",
            default_model="gemini-2.0-flash",
        ),
    ]
    return providers