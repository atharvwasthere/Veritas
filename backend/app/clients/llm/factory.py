"""LLM provider factory. Single place to switch between vendors."""
from __future__ import annotations

from app.core.config import Settings
from app.core.logging import get_logger

from .anthropic_client import AnthropicLLM
from .gemini_client import GeminiLLM
from .protocol import LLMPort

log = get_logger(__name__)


class LLMConfigError(RuntimeError):
    pass


def build_llm(settings: Settings) -> LLMPort:
    provider = settings.llm_provider.lower()
    if provider == "gemini":
        if not settings.gemini_api_key:
            raise LLMConfigError("GEMINI_API_KEY not configured")
        log.info("LLM provider: gemini (%s)", settings.gemini_model)
        return GeminiLLM(api_key=settings.gemini_api_key, model=settings.gemini_model)
    if provider == "anthropic":
        if not settings.anthropic_api_key:
            raise LLMConfigError("ANTHROPIC_API_KEY not configured")
        log.info("LLM provider: anthropic (%s)", settings.anthropic_model)
        return AnthropicLLM(api_key=settings.anthropic_api_key, model=settings.anthropic_model)
    raise LLMConfigError(f"unknown LLM_PROVIDER: {settings.llm_provider}")
