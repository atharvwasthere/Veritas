"""Online presence: press search + media/blog page scrapes."""
from __future__ import annotations

from app.models.audit import Category, CategoryEvidence

from ._formatting import format_scrapes, format_search_hits
from .base import BaseExtractor, ExtractorContext


class OnlinePresenceExtractor(BaseExtractor):
    category = Category.ONLINE_PRESENCE

    KEYWORDS = ["/press", "/news", "/blog", "/media", "/newsroom"]
    FALLBACK = ["/press", "/news", "/blog"]

    async def extract(self, ctx: ExtractorContext) -> CategoryEvidence:
        press_hits = (
            await self._searcher.search(
                f"{ctx.company_name} news press coverage", limit=8
            )
            if self._searcher
            else []
        )
        scrapes = []
        if ctx.site_mapper:
            scrapes = await ctx.site_mapper.scrape_first(
                self.KEYWORDS, fallback_paths=self.FALLBACK, max_pages=2
            )

        body = (
            "**Press mentions (web search):**\n"
            + format_search_hits(press_hits)
            + "\n\n**Press / blog pages on site:**\n"
            + format_scrapes(scrapes, per_page_chars=1500)
        )
        return CategoryEvidence(
            category=self.category,
            summary_markdown=body,
            sources=[h.url for h in press_hits if h.url] + [s.url for s in scrapes],
            raw={"hits": len(press_hits), "pages": len(scrapes)},
            error=None,
        )
