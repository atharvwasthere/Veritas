"""Legitimacy: team/about pages + founder verification via search."""
from __future__ import annotations

from app.models.audit import Category, CategoryEvidence

from ._formatting import format_scrapes, format_search_hits
from .base import BaseExtractor, ExtractorContext


class LegitimacyExtractor(BaseExtractor):
    category = Category.LEGITIMACY

    KEYWORDS = ["/about", "/team", "/leadership", "/people", "/company"]
    FALLBACK = ["/about", "/team", "/about-us", "/company"]

    async def extract(self, ctx: ExtractorContext) -> CategoryEvidence:
        scrapes = []
        if ctx.site_mapper:
            scrapes = await ctx.site_mapper.scrape_first(
                self.KEYWORDS, fallback_paths=self.FALLBACK, max_pages=2
            )
        if not scrapes and self._scraper:
            home = await self._scraper.scrape(ctx.url)
            if home.markdown:
                scrapes = [home]

        founders_query = f"{ctx.company_name} founders cofounders linkedin"
        hits = await self._searcher.search(founders_query, limit=6) if self._searcher else []

        body = (
            "**Team / about pages:**\n"
            + format_scrapes(scrapes, per_page_chars=2000)
            + "\n\n**Founder/team search hits:**\n"
            + format_search_hits(hits)
        )
        sources = [s.url for s in scrapes] + [h.url for h in hits if h.url]
        return CategoryEvidence(
            category=self.category,
            summary_markdown=body,
            sources=sources,
            raw={"pages": len(scrapes), "search_hits": len(hits)},
            error=None if scrapes else "no_team_page",
        )
