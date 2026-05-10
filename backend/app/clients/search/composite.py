"""Search/Research chains. Try primary; on empty/error result, fall back."""
from __future__ import annotations

from typing import Any

from app.clients.anakin.protocols import ResearchPort, SearchHitDTO, SearchPort
from app.core.logging import get_logger

log = get_logger(__name__)


class CompositeSearcher:
    """Tries each ``SearchPort`` in order. Returns first non-empty result."""

    def __init__(self, ports: list[SearchPort]) -> None:
        if not ports:
            raise ValueError("CompositeSearcher requires at least one port")
        self._ports = ports

    async def search(self, query: str, *, limit: int = 8) -> list[SearchHitDTO]:
        for i, port in enumerate(self._ports):
            hits = await port.search(query, limit=limit)
            if hits:
                if i > 0:
                    log.info("search fallback hit (port=%d)", i)
                return hits
        return []


class CompositeResearcher:
    """Tries each ``ResearchPort`` in order. Returns first non-error result."""

    def __init__(self, ports: list[ResearchPort]) -> None:
        if not ports:
            raise ValueError("CompositeResearcher requires at least one port")
        self._ports = ports

    async def research(self, prompt: str) -> dict[str, Any]:
        last_err: dict[str, Any] = {}
        for i, port in enumerate(self._ports):
            payload = await port.research(prompt)
            if isinstance(payload, dict) and payload.get("summary"):
                if i > 0:
                    log.info("research fallback hit (port=%d)", i)
                return payload
            last_err = payload if isinstance(payload, dict) else {}
        return last_err or {"error": "all research backends failed"}
