"""Default registry of extractors. Composition root for the extractor layer."""
from __future__ import annotations

from app.clients.anakin import AnakinClient, ResearchPort, SearchPort

from .base import CategoryExtractor
from .compliance import ComplianceExtractor
from .financial import FinancialExtractor
from .growth import GrowthExtractor
from .legitimacy import LegitimacyExtractor
from .online_presence import OnlinePresenceExtractor
from .social_proof import SocialProofExtractor


def build_default_extractors(
    anakin: AnakinClient,
    *,
    searcher: SearchPort | None = None,
    researcher: ResearchPort | None = None,
) -> list[CategoryExtractor]:
    """Wire each extractor with the ports it needs (ISP).

    ``searcher`` / ``researcher`` default to the anakin client itself but can be
    swapped for a composite chain (Anakin → Gemini grounded) so that extractors
    keep working when Anakin's Perplexity backend is down.
    """
    s = searcher or anakin
    r = researcher or anakin
    return [
        LegitimacyExtractor(scraper=anakin, searcher=s),
        FinancialExtractor(scraper=anakin, researcher=r, searcher=s),
        OnlinePresenceExtractor(scraper=anakin, searcher=s),
        ComplianceExtractor(scraper=anakin, crawler=anakin, mapper=anakin),
        SocialProofExtractor(scraper=anakin, searcher=s),
        GrowthExtractor(scraper=anakin, researcher=r, searcher=s),
    ]
