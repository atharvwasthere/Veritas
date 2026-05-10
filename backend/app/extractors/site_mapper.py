"""Discover relevant URLs on a domain once, share across extractors.

Avoids guessing ``/about`` / ``/careers`` / ``/customers`` paths that 404 on most
modern sites. Maps the site via Anakin's ``/v1/map`` and exposes keyword-based
lookups so each extractor can ask for the URLs it needs without re-mapping.
"""
from __future__ import annotations

import asyncio
from typing import Iterable

from app.clients.anakin import MapPort, ScraperPort, ScrapeResultDTO
from app.core.logging import get_logger

log = get_logger(__name__)


class SiteMapper:
    """Maps a domain once and serves cached link queries.

    All methods are safe to call from multiple extractors concurrently — the first
    caller triggers the map, subsequent callers await the same result.
    """

    def __init__(self, *, mapper: MapPort, scraper: ScraperPort) -> None:
        self._mapper = mapper
        self._scraper = scraper
        self._links: list[str] = []
        self._lock = asyncio.Lock()
        self._loaded = False
        self._root_url: str | None = None

    async def load(self, url: str) -> list[str]:
        """Map the site lazily. Idempotent."""
        if self._loaded:
            return self._links
        async with self._lock:
            if self._loaded:
                return self._links
            self._root_url = url
            self._links = await self._mapper.map(url, limit=200)
            self._loaded = True
            log.info("sitemap loaded root=%s links=%d", url, len(self._links))
            return self._links

    async def find(self, keywords: Iterable[str], *, limit: int = 5) -> list[str]:
        """Return links whose path or query contains any keyword (case-insensitive)."""
        await self.load(self._root_url or "")
        kws = [k.lower() for k in keywords]
        hits: list[str] = []
        for link in self._links:
            low = link.lower()
            if any(k in low for k in kws):
                hits.append(link)
                if len(hits) >= limit:
                    break
        return hits

    async def scrape_first(
        self,
        keywords: Iterable[str],
        *,
        fallback_paths: Iterable[str] = (),
        max_pages: int = 2,
    ) -> list[ScrapeResultDTO]:
        """Find pages by keyword and scrape them. Falls back to guessed paths if
        the map yields nothing (or if Map API is unavailable)."""
        urls = await self.find(keywords, limit=max_pages)
        if not urls and self._root_url:
            base = self._root_url.rstrip("/")
            urls = [f"{base}{p}" for p in fallback_paths][:max_pages]
        if not urls:
            return []
        results = await asyncio.gather(*(self._scraper.scrape(u) for u in urls))
        return [r for r in results if not r.error and r.markdown]
