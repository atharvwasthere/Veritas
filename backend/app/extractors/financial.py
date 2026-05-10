"""Financial signals: agentic research (best-effort) + revenue search."""
from __future__ import annotations

from app.models.audit import Category, CategoryEvidence

from ._formatting import format_scrapes, format_search_hits
from .base import BaseExtractor, ExtractorContext


class FinancialExtractor(BaseExtractor):
    category = Category.FINANCIAL

    KEYWORDS = ["/investor", "/investors", "/press", "/about", "/pricing"]

    async def extract(self, ctx: ExtractorContext) -> CategoryEvidence:
        research_prompt = (
            f"Funding history, latest round, investors, and revenue or ARR signals for "
            f"{ctx.company_name} ({ctx.domain})."
        )
        report = (
            await self._researcher.research(research_prompt) if self._researcher else {}
        )
        revenue_hits = (
            await self._searcher.search(
                f"{ctx.company_name} revenue ARR valuation funding", limit=6
            )
            if self._searcher
            else []
        )
        # Best-effort scrape of investor / pricing pages from the live site.
        scrapes = []
        if ctx.site_mapper:
            scrapes = await ctx.site_mapper.scrape_first(self.KEYWORDS, max_pages=2)

        summary = report.get("summary") if isinstance(report, dict) else None
        err = report.get("error") if isinstance(report, dict) else None

        body = (
            "**Funding research (Anakin agentic search):**\n"
            + (summary or "_(no agentic-search summary available)_")
            + "\n\n**Revenue/valuation hits:**\n"
            + format_search_hits(revenue_hits)
            + "\n\n**Investor / pricing pages from the site:**\n"
            + format_scrapes(scrapes, per_page_chars=1200)
        )
        return CategoryEvidence(
            category=self.category,
            summary_markdown=body,
            sources=[h.url for h in revenue_hits if h.url] + [s.url for s in scrapes],
            raw={
                "agentic_ok": bool(summary),
                "search_count": len(revenue_hits),
                "site_pages": len(scrapes),
            },
            error=err,
        )
