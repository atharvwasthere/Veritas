"""Generic async-job poller. Owns the wait loop so callers stay declarative."""
from __future__ import annotations

import asyncio
from typing import Any, Awaitable, Callable

from app.core.logging import get_logger

log = get_logger(__name__)


class JobFailedError(RuntimeError):
    pass


class JobTimeoutError(RuntimeError):
    pass


def _short(d: dict[str, Any], n: int = 240) -> str:
    s = str(d)
    return s if len(s) <= n else s[:n] + "…"


async def poll_until_complete(
    fetch: Callable[[], Awaitable[dict[str, Any]]],
    *,
    interval_s: float,
    max_wait_s: float,
) -> dict[str, Any]:
    """Poll ``fetch`` until it returns a payload with status=completed.

    Raises JobFailedError on terminal failure, JobTimeoutError on deadline.
    """
    deadline = asyncio.get_event_loop().time() + max_wait_s
    while True:
        payload = await fetch()
        status = payload.get("status")
        if status == "completed":
            return payload
        if status == "failed":
            err = payload.get("error") or payload.get("message") or "anakin job failed"
            log.warning("anakin job failed payload=%s", _short(payload))
            raise JobFailedError(str(err))
        # If we're well past first poll and still pending with no progress field,
        # bail early when the message field embeds a perplexity quota error.
        msg = (payload.get("message") or "").lower()
        if "insufficient_quota" in msg or "search_error" in msg:
            log.warning("anakin job soft-fail payload=%s", _short(payload))
            raise JobFailedError(str(payload.get("message")))
        if asyncio.get_event_loop().time() > deadline:
            raise JobTimeoutError(f"timeout after {max_wait_s}s")
        await asyncio.sleep(interval_s)
