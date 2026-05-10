"""Composition root: assembles concrete services for the API layer."""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

import httpx

from app.analyzers import FrameworkAnalyzer, ScoringAnalyzer
from app.clients.anakin import AnakinClient
from app.clients.llm import build_llm
from app.clients.search import (
    CompositeResearcher,
    CompositeSearcher,
    GeminiGroundedResearcher,
    GeminiGroundedSearcher,
)
from app.core.config import Settings
from app.core.logging import get_logger
from app.extractors import build_default_extractors
from app.planner import AuditPlanner
from app.services import AuditService
from app.workers import ExtractionWorker

log = get_logger(__name__)


@asynccontextmanager
async def build_audit_service(settings: Settings) -> AsyncIterator[AuditService]:
    """Per-request scope: owns the httpx client lifetime."""
    async with httpx.AsyncClient(timeout=settings.request_timeout_s) as http:
        anakin = AnakinClient(
            api_key=settings.anakin_api_key,
            base_url=settings.anakin_base_url,
            http=http,
        )
        llm = build_llm(settings)

        # Search/research chain. Anakin is primary (fast when up). Gemini grounded
        # search is fallback — kicks in automatically when Anakin's Perplexity
        # backend returns 500 / quota errors.
        searcher: object = anakin
        researcher: object = anakin
        if settings.gemini_api_key:
            gemini_search_model = settings.gemini_search_model or "gemini-2.5-flash"
            gem_search = GeminiGroundedSearcher(
                api_key=settings.gemini_api_key, model=gemini_search_model
            )
            gem_research = GeminiGroundedResearcher(
                api_key=settings.gemini_api_key, model=gemini_search_model
            )
            searcher = CompositeSearcher([anakin, gem_search])
            researcher = CompositeResearcher([anakin, gem_research])
            log.info("search chain: anakin -> gemini-grounded (%s)", gemini_search_model)
        else:
            log.warning("no GEMINI_API_KEY — search/research has no fallback")

        planner = AuditPlanner(
            build_default_extractors(anakin, searcher=searcher, researcher=researcher),
            anakin,
        )
        worker = ExtractionWorker(concurrency=settings.extractor_concurrency)
        scoring = ScoringAnalyzer(llm)
        frameworks = FrameworkAnalyzer(llm)

        yield AuditService(
            planner=planner,
            worker=worker,
            scoring=scoring,
            frameworks=frameworks,
        )
