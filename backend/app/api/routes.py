"""HTTP routes for the audit API. Two endpoints:

- POST /audit               → runs the full pipeline, returns the final AuditReport.
- POST /audit/stream        → same pipeline but streams progress as Server-Sent Events.
"""
from __future__ import annotations

import asyncio
import json
from typing import AsyncIterator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.api.dependencies import build_audit_service
from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.audit import AuditRequest
from app.workers import ExtractorEvent

router = APIRouter(prefix="/audit", tags=["audit"])
log = get_logger(__name__)


@router.post("")
async def run_audit(request: AuditRequest) -> dict:
    settings = get_settings()
    _require_keys(settings)
    try:
        async with build_audit_service(settings) as service:
            report = await service.run(request)
            return json.loads(report.model_dump_json())
    except Exception as e:  # noqa: BLE001
        log.exception("audit endpoint failed")
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")


@router.post("/stream")
async def run_audit_stream(request: AuditRequest) -> StreamingResponse:
    settings = get_settings()
    _require_keys(settings)

    queue: asyncio.Queue[str | None] = asyncio.Queue()

    async def on_event(ev: ExtractorEvent) -> None:
        await queue.put(_sse({"type": "extractor", "category": ev.category.value, "phase": ev.phase, "detail": ev.detail}))

    async def producer() -> None:
        try:
            async with build_audit_service(settings) as service:
                await queue.put(_sse({"type": "started", "url": str(request.url)}))
                report = await service.run(request, on_event=on_event)
                await queue.put(_sse({"type": "report", "data": json.loads(report.model_dump_json())}))
        except Exception as e:  # noqa: BLE001
            log.exception("stream audit failed")
            await queue.put(_sse({"type": "error", "message": str(e)}))
        finally:
            await queue.put(None)

    async def stream() -> AsyncIterator[str]:
        task = asyncio.create_task(producer())
        try:
            while True:
                item = await queue.get()
                if item is None:
                    break
                yield item
        finally:
            await task

    return StreamingResponse(stream(), media_type="text/event-stream")


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload)}\n\n"


def _require_keys(settings) -> None:
    if not settings.anakin_api_key:
        raise HTTPException(status_code=500, detail="ANAKIN_API_KEY not configured")
    provider = settings.llm_provider.lower()
    if provider == "gemini" and not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    if provider == "anthropic" and not settings.anthropic_api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")
    if provider not in {"gemini", "anthropic"}:
        raise HTTPException(status_code=500, detail=f"unknown LLM_PROVIDER: {settings.llm_provider}")
