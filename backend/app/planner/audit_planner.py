"""Planner: turns an AuditRequest into a concrete plan of extractor invocations.

Today the plan is "run every registered extractor" plus a shared SiteMapper. The
seam exists so we can later add domain-specific routing (skip compliance for
non-SaaS, etc.) without touching workers or the service layer.
"""
from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlparse

from app.clients.anakin import AnakinClient
from app.extractors import CategoryExtractor, ExtractorContext
from app.extractors.site_mapper import SiteMapper
from app.models.audit import AuditRequest


@dataclass(frozen=True)
class AuditPlan:
    context: ExtractorContext
    extractors: list[CategoryExtractor]


class AuditPlanner:
    def __init__(self, extractors: list[CategoryExtractor], anakin: AnakinClient) -> None:
        self._extractors = extractors
        self._anakin = anakin

    def plan(self, request: AuditRequest) -> AuditPlan:
        url = str(request.url)
        domain = urlparse(url).netloc
        company = request.company_name or _company_from_domain(domain)
        site_mapper = SiteMapper(mapper=self._anakin, scraper=self._anakin)
        ctx = ExtractorContext(
            url=url,
            company_name=company,
            domain=domain,
            site_mapper=site_mapper,
        )
        return AuditPlan(context=ctx, extractors=list(self._extractors))


def _company_from_domain(domain: str) -> str:
    host = domain.split(":")[0]
    if host.startswith("www."):
        host = host[4:]
    return host.split(".")[0].capitalize()
