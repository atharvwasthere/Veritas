"""Shared markdown formatting helpers used by extractors."""
from __future__ import annotations

from app.clients.anakin.protocols import ScrapeResultDTO, SearchHitDTO


def truncate(text: str, limit: int = 4000) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + "…"


def format_search_hits(hits: list[SearchHitDTO]) -> str:
    if not hits:
        return "_(no results)_"
    return "\n".join(f"- [{h.title}]({h.url}) — {h.snippet}" for h in hits)


def format_scrapes(scrapes: list[ScrapeResultDTO], *, per_page_chars: int = 1500) -> str:
    sections: list[str] = []
    for s in scrapes:
        if s.error or not s.markdown:
            continue
        sections.append(f"### {s.url}\n\n{truncate(s.markdown, per_page_chars)}")
    return "\n\n".join(sections) if sections else "_(no pages scraped)_"
