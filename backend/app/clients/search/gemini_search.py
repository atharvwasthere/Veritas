"""Gemini-grounded web search/research adapters.

Uses Gemini 2.5's native ``google_search`` tool to bypass Anakin's Perplexity
backend entirely. Implements ``SearchPort`` and ``ResearchPort`` so it slots in
behind the existing extractors without changes.
"""
from __future__ import annotations

import time
from typing import Any

from google import genai
from google.genai import types

from app.clients.anakin.protocols import SearchHitDTO
from app.core.logging import get_logger

log = get_logger(__name__)


class _GeminiBase:
    def __init__(self, *, api_key: str, model: str) -> None:
        self._client = genai.Client(api_key=api_key)
        self._model = model

    async def _grounded(self, prompt: str, *, temperature: float) -> tuple[str, list[dict[str, str]]]:
        """Run a grounded Gemini call, return (text, citations)."""
        config = types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())],
            temperature=temperature,
            max_output_tokens=2048,
        )
        response = await self._client.aio.models.generate_content(
            model=self._model, contents=prompt, config=config
        )
        text = (response.text or "").strip()
        citations: list[dict[str, str]] = []
        cands = getattr(response, "candidates", None) or []
        if cands:
            gm = getattr(cands[0], "grounding_metadata", None)
            chunks = getattr(gm, "grounding_chunks", None) or [] if gm else []
            for c in chunks:
                web = getattr(c, "web", None)
                if not web:
                    continue
                uri = getattr(web, "uri", "") or ""
                title = getattr(web, "title", "") or uri
                if uri:
                    citations.append({"url": uri, "title": title})
        return text, citations


class GeminiGroundedSearcher(_GeminiBase):
    """Implements ``SearchPort`` via Gemini's google_search tool."""

    async def search(self, query: str, *, limit: int = 8) -> list[SearchHitDTO]:
        t0 = time.perf_counter()
        prompt = (
            f"Search the public web for: {query}\n\n"
            f"Return a one-paragraph factual summary. Be specific. "
            f"List the most relevant {limit} sources you used."
        )
        try:
            text, citations = await self._grounded(prompt, temperature=0.0)
            hits: list[SearchHitDTO] = []
            for c in citations[:limit]:
                hits.append(
                    SearchHitDTO(
                        title=c.get("title", "") or c.get("url", ""),
                        url=c.get("url", ""),
                        snippet=_clip(text, 220),
                        source="gemini-grounded",
                    )
                )
            log.info(
                "gemini-search ok q=%r ms=%d hits=%d", query, _ms(t0), len(hits)
            )
            return hits
        except Exception as e:  # noqa: BLE001
            log.warning("gemini-search FAIL q=%r ms=%d err=%s", query, _ms(t0), e)
            return []


class GeminiGroundedResearcher(_GeminiBase):
    """Implements ``ResearchPort`` via Gemini's google_search tool. Replaces
    Anakin's agentic-search when its Perplexity backend is dead."""

    async def research(self, prompt: str) -> dict[str, Any]:
        t0 = time.perf_counter()
        try:
            text, citations = await self._grounded(prompt, temperature=0.2)
            log.info(
                "gemini-research ok prompt=%.40r ms=%d summary=%d cites=%d",
                prompt, _ms(t0), len(text), len(citations),
            )
            return {
                "summary": text,
                "structured_data": {"sources": citations},
                "data_schema": {},
            }
        except Exception as e:  # noqa: BLE001
            log.warning("gemini-research FAIL prompt=%.40r ms=%d err=%s", prompt, _ms(t0), e)
            return {"error": str(e)}


def _ms(t0: float) -> int:
    return int((time.perf_counter() - t0) * 1000)


def _clip(s: str, n: int) -> str:
    return s if len(s) <= n else s[: n - 1].rstrip() + "…"
