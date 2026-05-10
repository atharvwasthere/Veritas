"""Growth signals: careers/jobs page + agentic research (best-effort)."""
from __future__ import annotations

from app.models.audit import Category, CategoryEvidence

from ._formatting import format_scrapes, format_search_hits
from .base import BaseExtractor, ExtractorContext


class GrowthExtractor(BaseExtractor):
    category = Category.GROWTH

    KEYWORDS = ["/career", "/careers", "/jobs", "/hiring", "/work-with-us"]
    FALLBACK = ["/careers", "/jobs", "/hiring"]

    async def extract(self, ctx: ExtractorContext) -> CategoryEvidence:
        scrapes = []
        if ctx.site_mapper:
            scrapes = await ctx.site_mapper.scrape_first(
                self.KEYWORDS, fallback_paths=self.FALLBACK, max_pages=2
            )

        launches = (
            await self._researcher.research(
                f"Recent product launches, hiring trends, and momentum signals for "
                f"{ctx.company_name} ({ctx.domain})."
            )
            if self._researcher
            else {}
        )
        # Fallback: web search for product launches if agentic-search is down.
        launch_hits = []
        if (not isinstance(launches, dict) or not launches.get("summary")) and self._searcher:
            launch_hits = await self._searcher.search(
                f"{ctx.company_name} new product launch announcement", limit=5
            )

        summary = launches.get("summary") if isinstance(launches, dict) else None
        err = launches.get("error") if isinstance(launches, dict) else None

        body = (
            "**Careers / hiring pages:**\n"
            + format_scrapes(scrapes, per_page_chars=1500)
            + "\n\n**Product/momentum research (agentic search):**\n"
            + (summary or "_(agentic-search unavailable; using web-search fallback)_")
            + (
                "\n\n**Launch search fallback:**\n" + format_search_hits(launch_hits)
                if launch_hits
                else ""
            )
        )
        return CategoryEvidence(
            category=self.category,
            summary_markdown=body,
            sources=[s.url for s in scrapes] + [h.url for h in launch_hits if h.url],
            raw={
                "pages": len(scrapes),
                "agentic_ok": bool(summary),
                "fallback_hits": len(launch_hits),
            },
            error=err if not summary and not scrapes else None,
        )
