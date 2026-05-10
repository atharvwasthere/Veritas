"""Social proof: customer/case-study pages + review search."""
from __future__ import annotations

from app.models.audit import Category, CategoryEvidence

from ._formatting import format_scrapes, format_search_hits
from .base import BaseExtractor, ExtractorContext


class SocialProofExtractor(BaseExtractor):
    category = Category.SOCIAL_PROOF

    KEYWORDS = ["/customer", "/customers", "/case", "/case-stud", "/testimonial"]
    FALLBACK = ["/customers", "/case-studies", "/testimonials"]

    async def extract(self, ctx: ExtractorContext) -> CategoryEvidence:
        scrapes = []
        if ctx.site_mapper:
            scrapes = await ctx.site_mapper.scrape_first(
                self.KEYWORDS, fallback_paths=self.FALLBACK, max_pages=2
            )

        reviews = (
            await self._searcher.search(
                f"{ctx.company_name} reviews G2 Capterra Trustpilot", limit=6
            )
            if self._searcher
            else []
        )

        body = (
            "**Customers / case-studies pages:**\n"
            + format_scrapes(scrapes, per_page_chars=1500)
            + "\n\n**Third-party reviews:**\n"
            + format_search_hits(reviews)
        )
        return CategoryEvidence(
            category=self.category,
            summary_markdown=body,
            sources=[s.url for s in scrapes] + [r.url for r in reviews if r.url],
            raw={"pages": len(scrapes), "reviews": len(reviews)},
            error=None,
        )
