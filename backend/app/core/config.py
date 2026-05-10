"""Application settings sourced from environment variables."""
from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    anakin_api_key: str
    anakin_base_url: str
    llm_provider: str
    anthropic_api_key: str
    anthropic_model: str
    gemini_api_key: str
    gemini_model: str
    gemini_search_model: str
    cors_origins: tuple[str, ...]
    extractor_concurrency: int
    request_timeout_s: float


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings(
        anakin_api_key=os.getenv("ANAKIN_API_KEY", ""),
        anakin_base_url=os.getenv("ANAKIN_BASE_URL", "https://api.anakin.io/v1"),
        llm_provider=os.getenv("LLM_PROVIDER", "gemini"),
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY", ""),
        anthropic_model=os.getenv("ANTHROPIC_MODEL", "claude-opus-4-7"),
        gemini_api_key=os.getenv("GEMINI_API_KEY", ""),
        gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.5-pro"),
        gemini_search_model=os.getenv("GEMINI_SEARCH_MODEL", "gemini-2.5-flash"),
        cors_origins=tuple(
            o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()
        ),
        extractor_concurrency=int(os.getenv("EXTRACTOR_CONCURRENCY", "6")),
        request_timeout_s=float(os.getenv("REQUEST_TIMEOUT_S", "30")),
    )
