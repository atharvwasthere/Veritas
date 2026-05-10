"""Capability ports for the Anakin primitives.

Extractors depend on these narrow protocols, never on the concrete client. This keeps
each extractor honest about which primitives it actually needs (ISP) and lets us swap
implementations or fakes for tests (DIP).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol


@dataclass(frozen=True)
class ScrapeResultDTO:
    url: str
    markdown: str = ""
    error: str | None = None


@dataclass(frozen=True)
class SearchHitDTO:
    title: str
    url: str
    snippet: str = ""
    source: str = ""


class ScraperPort(Protocol):
    async def scrape(self, url: str, *, use_browser: bool = True) -> ScrapeResultDTO: ...


class SearchPort(Protocol):
    async def search(self, query: str, *, limit: int = 8) -> list[SearchHitDTO]: ...


class ResearchPort(Protocol):
    async def research(self, prompt: str) -> dict[str, Any]: ...


class CrawlerPort(Protocol):
    async def crawl(
        self,
        url: str,
        *,
        max_pages: int = 8,
        include_patterns: list[str] | None = None,
    ) -> list[ScrapeResultDTO]: ...


class MapPort(Protocol):
    async def map(self, url: str, *, limit: int = 200, search: str | None = None) -> list[str]: ...
