"""Extractor contract.

One extractor per audit category. Each is responsible for collecting evidence for
its category and returning a CategoryEvidence. New categories are added by writing
a new extractor and registering it — the planner and worker remain untouched (OCP).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

from app.clients.anakin import (
    CrawlerPort,
    MapPort,
    ResearchPort,
    ScraperPort,
    SearchPort,
)
from app.models.audit import Category, CategoryEvidence

from .site_mapper import SiteMapper


@dataclass
class ExtractorContext:
    """Inputs every extractor receives. Keeps the call signature stable."""

    url: str
    company_name: str
    domain: str
    site_mapper: SiteMapper | None = None
    shared: dict[str, object] = field(default_factory=dict)


class CategoryExtractor(Protocol):
    """Single-responsibility unit: gather evidence for one category."""

    category: Category

    async def extract(self, ctx: ExtractorContext) -> CategoryEvidence: ...


class BaseExtractor:
    """Convenience base. Holds shared dependencies and a category attribute.

    Subclasses set the class attribute ``category`` and implement ``extract``.
    """

    category: Category

    def __init__(
        self,
        *,
        scraper: ScraperPort | None = None,
        searcher: SearchPort | None = None,
        researcher: ResearchPort | None = None,
        crawler: CrawlerPort | None = None,
        mapper: MapPort | None = None,
    ) -> None:
        self._scraper = scraper
        self._searcher = searcher
        self._researcher = researcher
        self._crawler = crawler
        self._mapper = mapper

    async def extract(self, ctx: ExtractorContext) -> CategoryEvidence:  # pragma: no cover - abstract
        raise NotImplementedError
