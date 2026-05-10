"""Worker: executes an audit plan concurrently, emitting progress events.

Owns the concurrency policy (semaphore + per-extractor error isolation) so the planner
and service stay declarative.
"""
from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass
from typing import Awaitable, Callable

from app.core.logging import get_logger
from app.extractors import CategoryExtractor, ExtractorContext
from app.models.audit import Category, CategoryEvidence

log = get_logger(__name__)


@dataclass(frozen=True)
class ExtractorEvent:
    category: Category
    phase: str  # "started" | "completed" | "failed"
    detail: str = ""


ProgressSink = Callable[[ExtractorEvent], Awaitable[None]] | None


class ExtractionWorker:
    def __init__(self, *, concurrency: int = 6) -> None:
        self._sem = asyncio.Semaphore(concurrency)

    async def run(
        self,
        extractors: list[CategoryExtractor],
        ctx: ExtractorContext,
        *,
        on_event: ProgressSink = None,
    ) -> dict[Category, CategoryEvidence]:
        log.info(
            "extraction start company=%s url=%s extractors=%d",
            ctx.company_name,
            ctx.url,
            len(extractors),
        )

        async def _one(ex: CategoryExtractor) -> tuple[Category, CategoryEvidence]:
            async with self._sem:
                t0 = time.perf_counter()
                log.info("[%s] start", ex.category.value)
                await _emit(on_event, ExtractorEvent(ex.category, "started"))
                try:
                    ev = await ex.extract(ctx)
                    ms = int((time.perf_counter() - t0) * 1000)
                    if ev.error:
                        log.warning(
                            "[%s] partial ms=%d err=%s evidence_chars=%d",
                            ex.category.value, ms, ev.error, len(ev.summary_markdown),
                        )
                    else:
                        log.info(
                            "[%s] done ms=%d evidence_chars=%d sources=%d",
                            ex.category.value, ms, len(ev.summary_markdown), len(ev.sources),
                        )
                    await _emit(
                        on_event,
                        ExtractorEvent(ex.category, "completed", detail=ev.error or ""),
                    )
                    return ex.category, ev
                except Exception as e:  # noqa: BLE001 — isolate per extractor
                    ms = int((time.perf_counter() - t0) * 1000)
                    log.exception("[%s] FAILED ms=%d", ex.category.value, ms)
                    await _emit(on_event, ExtractorEvent(ex.category, "failed", detail=str(e)))
                    return ex.category, CategoryEvidence(
                        category=ex.category,
                        summary_markdown=f"_(extractor error: {e})_",
                        error=str(e),
                    )

        t0 = time.perf_counter()
        results = await asyncio.gather(*(_one(ex) for ex in extractors))
        log.info("extraction done ms=%d", int((time.perf_counter() - t0) * 1000))
        return dict(results)


async def _emit(sink: ProgressSink, event: ExtractorEvent) -> None:
    if sink is None:
        return
    try:
        await sink(event)
    except Exception:  # noqa: BLE001
        log.warning("progress sink raised; ignoring", exc_info=True)
