"""HTTP client for the Anakin primitives. Implements all five ports."""
from __future__ import annotations

import time
from typing import Any

import httpx

from app.core.logging import get_logger

from .polling import poll_until_complete
from .protocols import ScrapeResultDTO, SearchHitDTO

log = get_logger(__name__)


def _job_id(payload: dict[str, Any]) -> str | None:
    """Anakin's submit responses use ``jobId`` (camelCase) for sync products and
    ``job_id`` for agentic search. Accept either, plus the bare ``id`` used by
    completed payloads."""
    return payload.get("jobId") or payload.get("job_id") or payload.get("id")


class AnakinClient:
    """Single httpx-backed client. One instance per request lifecycle."""

    def __init__(self, *, api_key: str, base_url: str, http: httpx.AsyncClient) -> None:
        self._http = http
        self._base = base_url.rstrip("/")
        self._headers = {"X-API-Key": api_key, "Content-Type": "application/json"}
        # Circuit breaker — once Anakin's Perplexity backend reports quota / search
        # error, every subsequent /search and /agentic-search short-circuits to
        # empty so we don't burn the audit's wall-clock waiting on dead calls.
        self._perplexity_dead: bool = False
        self._perplexity_reason: str = ""

    # ---------- ScraperPort ----------
    # SPAs (Groww, Zepto, most modern marketing sites) render via JS — default to
    # browser mode so we always have something to read.
    async def scrape(self, url: str, *, use_browser: bool = True) -> ScrapeResultDTO:
        t0 = time.perf_counter()
        payload = {"url": url, "useBrowser": use_browser}
        try:
            r = await self._http.post(
                f"{self._base}/url-scraper", headers=self._headers, json=payload
            )
            self._raise_with_body(r, "url-scraper")
            job = r.json()
            jid = _job_id(job)
            if job.get("status") == "completed" and job.get("markdown"):
                md = job["markdown"]
                log.info("scrape ok url=%s ms=%d md=%d (sync)", url, _ms(t0), len(md))
                return ScrapeResultDTO(url=url, markdown=md)
            if not jid:
                log.warning("scrape no jobId url=%s payload_keys=%s", url, list(job.keys()))
                return ScrapeResultDTO(url=url, error="no_job_id")
            data = await poll_until_complete(
                lambda: self._get_job(f"/url-scraper/{jid}"),
                interval_s=3,
                max_wait_s=120,
            )
            md = data.get("markdown", "") or ""
            log.info("scrape ok url=%s ms=%d md=%d", url, _ms(t0), len(md))
            return ScrapeResultDTO(url=url, markdown=md)
        except Exception as e:  # noqa: BLE001
            log.warning("scrape FAIL url=%s ms=%d err=%s", url, _ms(t0), e)
            return ScrapeResultDTO(url=url, error=str(e))

    # ---------- SearchPort ----------
    async def search(self, query: str, *, limit: int = 8) -> list[SearchHitDTO]:
        if self._perplexity_dead:
            log.info("search skipped (perplexity_dead: %s)", self._perplexity_reason)
            return []
        t0 = time.perf_counter()
        clean = _sanitize_query(query)
        try:
            r = await self._http.post(
                f"{self._base}/search",
                headers=self._headers,
                json={"prompt": clean, "limit": limit},
            )
            if not r.is_success:
                self._maybe_trip_perplexity(r.status_code, _safe_text(r))
                self._raise_with_body(r, "search")
            results = (r.json() or {}).get("results", []) or []
            hits = [
                SearchHitDTO(
                    title=h.get("title", ""),
                    url=h.get("url", ""),
                    snippet=h.get("snippet", ""),
                    source=h.get("source", ""),
                )
                for h in results
            ]
            log.info("search ok q=%r ms=%d hits=%d", clean, _ms(t0), len(hits))
            return hits
        except Exception as e:  # noqa: BLE001
            log.warning("search FAIL q=%r ms=%d err=%s", clean, _ms(t0), e)
            return []

    # ---------- ResearchPort ----------
    async def research(self, prompt: str) -> dict[str, Any]:
        if self._perplexity_dead:
            log.info("research skipped (perplexity_dead: %s)", self._perplexity_reason)
            return {"error": f"skipped: {self._perplexity_reason}"}
        t0 = time.perf_counter()
        try:
            r = await self._http.post(
                f"{self._base}/agentic-search",
                headers=self._headers,
                json={"prompt": prompt},
            )
            if not r.is_success:
                self._maybe_trip_perplexity(r.status_code, _safe_text(r))
                self._raise_with_body(r, "agentic-search")
            job = r.json()
            jid = _job_id(job)
            if not jid:
                log.info("research ok prompt=%.40r ms=%d (sync)", prompt, _ms(t0))
                return job.get("generatedJson", {}) or {}
            data = await poll_until_complete(
                lambda: self._get_job(f"/agentic-search/{jid}"),
                interval_s=10,
                max_wait_s=120,
            )
            payload = data.get("generatedJson", {}) or {}
            summary_len = len(str(payload.get("summary") or ""))
            log.info(
                "research ok prompt=%.40r ms=%d summary=%d", prompt, _ms(t0), summary_len
            )
            return payload
        except Exception as e:  # noqa: BLE001
            self._maybe_trip_perplexity(0, str(e))
            log.warning("research FAIL prompt=%.40r ms=%d err=%s", prompt, _ms(t0), e)
            return {"error": str(e)}

    # ---------- CrawlerPort ----------
    async def crawl(
        self,
        url: str,
        *,
        max_pages: int = 8,
        include_patterns: list[str] | None = None,
    ) -> list[ScrapeResultDTO]:
        t0 = time.perf_counter()
        # Always render JS — same reason as scrape().
        payload: dict[str, Any] = {"url": url, "maxPages": max_pages, "useBrowser": True}
        if include_patterns:
            payload["includePatterns"] = include_patterns
        try:
            r = await self._http.post(
                f"{self._base}/crawl", headers=self._headers, json=payload
            )
            self._raise_with_body(r, "crawl")
            job = r.json()
            jid = _job_id(job)
            if not jid:
                results = self._normalize_crawl(job.get("results", []) or [])
                log.info(
                    "crawl ok url=%s ms=%d pages=%d (sync)", url, _ms(t0), len(results)
                )
                return results
            data = await poll_until_complete(
                lambda: self._get_job(f"/crawl/{jid}"),
                interval_s=4,
                max_wait_s=300,
            )
            results = self._normalize_crawl(data.get("results", []) or [])
            ok = sum(1 for r in results if not r.error)
            log.info("crawl ok url=%s ms=%d pages=%d/%d", url, _ms(t0), ok, len(results))
            return results
        except Exception as e:  # noqa: BLE001
            log.warning("crawl FAIL url=%s ms=%d err=%s", url, _ms(t0), e)
            return [ScrapeResultDTO(url=url, error=str(e))]

    # ---------- MapPort ----------
    async def map(
        self, url: str, *, limit: int = 200, search: str | None = None
    ) -> list[str]:
        t0 = time.perf_counter()
        payload: dict[str, Any] = {"url": url, "limit": limit, "useBrowser": True}
        if search:
            payload["search"] = search
        try:
            r = await self._http.post(
                f"{self._base}/map", headers=self._headers, json=payload
            )
            self._raise_with_body(r, "map")
            job = r.json()
            jid = _job_id(job)
            if not jid:
                links = job.get("links", []) or []
                log.info("map ok url=%s ms=%d links=%d (sync)", url, _ms(t0), len(links))
                return list(links)
            data = await poll_until_complete(
                lambda: self._get_job(f"/map/{jid}"),
                interval_s=3,
                max_wait_s=120,
            )
            links = data.get("links", []) or []
            log.info(
                "map ok url=%s ms=%d links=%d search=%r", url, _ms(t0), len(links), search
            )
            return list(links)
        except Exception as e:  # noqa: BLE001
            log.warning("map FAIL url=%s ms=%d err=%s", url, _ms(t0), e)
            return []

    # ---------- internals ----------
    async def _get_job(self, path: str) -> dict[str, Any]:
        r = await self._http.get(f"{self._base}{path}", headers=self._headers)
        self._raise_with_body(r, path)
        return r.json() or {}

    def _maybe_trip_perplexity(self, status: int, body: str) -> None:
        """Trip the circuit breaker on any signal that Anakin's Perplexity backend
        is dead (quota, search_error). Idempotent."""
        if self._perplexity_dead:
            return
        low = (body or "").lower()
        triggers = (
            "search_error",
            "perplexity",
            "insufficient_quota",
            "exceeded your current quota",
        )
        if status == 500 or any(t in low for t in triggers):
            reason = "perplexity backend unavailable (quota/search_error)"
            self._perplexity_dead = True
            self._perplexity_reason = reason
            log.warning("PERPLEXITY DEAD — short-circuiting search/research for this request")

    @staticmethod
    def _raise_with_body(r: httpx.Response, label: str) -> None:
        if r.is_success:
            return
        body = ""
        try:
            body = r.text[:500]
        except Exception:
            pass
        log.warning("anakin %s HTTP %s body=%s", label, r.status_code, body)
        r.raise_for_status()

    @staticmethod
    def _normalize_crawl(results: list[dict[str, Any]]) -> list[ScrapeResultDTO]:
        out: list[ScrapeResultDTO] = []
        for r in results:
            if r.get("status") == "completed":
                out.append(
                    ScrapeResultDTO(
                        url=r.get("url", ""), markdown=r.get("markdown", "") or ""
                    )
                )
            else:
                out.append(
                    ScrapeResultDTO(url=r.get("url", ""), error=r.get("error") or "failed")
                )
        return out


def _ms(t0: float) -> int:
    return int((time.perf_counter() - t0) * 1000)


def _safe_text(r: httpx.Response) -> str:
    try:
        return r.text[:500]
    except Exception:
        return ""


def _sanitize_query(q: str) -> str:
    """Strip Google-style operators that Anakin's search rejects."""
    import re

    s = q.replace('"', "").replace("'", "")
    s = re.sub(r"\b\w+:\S+", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s
