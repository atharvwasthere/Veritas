"""Compliance: legal pages discovered via Map, scraped individually."""
from __future__ import annotations

import asyncio

from app.models.audit import Category, CategoryEvidence

from ._formatting import format_scrapes
from .base import BaseExtractor, ExtractorContext


class ComplianceExtractor(BaseExtractor):
    category = Category.COMPLIANCE

    KEYWORDS = ["/privacy", "/terms", "/legal", "/security", "/cookie", "/gdpr"]
    FALLBACK = ["/privacy", "/terms", "/legal", "/security"]

    async def extract(self, ctx: ExtractorContext) -> CategoryEvidence:
        urls: list[str] = []
        if ctx.site_mapper:
            urls = await ctx.site_mapper.find(self.KEYWORDS, limit=6)
        if not urls:
            base = ctx.url.rstrip("/")
            urls = [f"{base}{p}" for p in self.FALLBACK]

        scrapes = []
        if self._scraper and urls:
            scrapes = await asyncio.gather(*(self._scraper.scrape(u) for u in urls[:6]))

        ok_pages = [s for s in scrapes if s and not s.error and s.markdown]
        body = (
            "**Legal/compliance pages:**\n\n"
            + format_scrapes(ok_pages, per_page_chars=1200)
        )
        return CategoryEvidence(
            category=self.category,
            summary_markdown=body,
            sources=[s.url for s in ok_pages],
            raw={
                "pages_attempted": len(urls),
                "pages_ok": len(ok_pages),
                "via_map": bool(ctx.site_mapper),
            },
            error=None if ok_pages else "no_legal_pages",
        )
