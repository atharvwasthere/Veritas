"""Application service that orchestrates a full audit run.

Flow: planner → site map (one-shot) → worker (parallel extraction) → scoring →
frameworks. The service knows the order; each collaborator knows only its own job.
"""
from __future__ import annotations

import time

from app.analyzers import FrameworkAnalyzer, ScoringAnalyzer
from app.core.logging import get_logger
from app.models.audit import AuditReport, AuditRequest
from app.planner import AuditPlanner
from app.workers import ExtractionWorker
from app.workers.extraction_worker import ProgressSink

log = get_logger(__name__)


class AuditService:
    def __init__(
        self,
        *,
        planner: AuditPlanner,
        worker: ExtractionWorker,
        scoring: ScoringAnalyzer,
        frameworks: FrameworkAnalyzer,
    ) -> None:
        self._planner = planner
        self._worker = worker
        self._scoring = scoring
        self._frameworks = frameworks

    async def run(self, request: AuditRequest, *, on_event: ProgressSink = None) -> AuditReport:
        t0 = time.perf_counter()
        plan = self._planner.plan(request)
        log.info("audit start company=%s url=%s", plan.context.company_name, plan.context.url)

        # Pre-warm the site map so every extractor sees a populated link cache.
        if plan.context.site_mapper:
            t_map = time.perf_counter()
            try:
                links = await plan.context.site_mapper.load(plan.context.url)
                log.info(
                    "site map ready ms=%d links=%d",
                    int((time.perf_counter() - t_map) * 1000),
                    len(links),
                )
            except Exception as e:  # noqa: BLE001
                log.warning("site map prewarm failed err=%s", e)

        evidence = await self._worker.run(plan.extractors, plan.context, on_event=on_event)

        t_score = time.perf_counter()
        scoring = await self._scoring.score(
            url=plan.context.url,
            company_name=plan.context.company_name,
            evidence=evidence,
        )
        log.info(
            "scoring done ms=%d risk=%s discrepancies=%d",
            int((time.perf_counter() - t_score) * 1000),
            scoring.overall_risk.value,
            len(scoring.discrepancies),
        )

        t_fw = time.perf_counter()
        frameworks = await self._frameworks.synthesize(
            url=plan.context.url,
            company_name=scoring.company_name,
            overall_summary=scoring.overall_summary,
            evidence=evidence,
        )
        log.info("frameworks done ms=%d", int((time.perf_counter() - t_fw) * 1000))

        report = AuditReport(
            company_name=scoring.company_name,
            url=plan.context.url,
            overall_risk=scoring.overall_risk,
            overall_summary=scoring.overall_summary,
            scores=scoring.scores,
            discrepancies=scoring.discrepancies,
            frameworks=frameworks,
            evidence=evidence,
        )
        log.info(
            "audit complete ms=%d company=%s risk=%s",
            int((time.perf_counter() - t0) * 1000),
            report.company_name,
            report.overall_risk.value,
        )
        return report
