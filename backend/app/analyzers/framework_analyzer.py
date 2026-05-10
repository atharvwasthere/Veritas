"""Generates SWOT / PESTLE / Porter / Heatmap / KPIs from scoring + evidence."""
from __future__ import annotations

from app.clients.llm import LLMPort
from app.models.audit import Category, CategoryEvidence, FrameworkBundle

from .prompts import FRAMEWORKS_SYSTEM, FRAMEWORKS_USER_TEMPLATE


class FrameworkAnalyzer:
    def __init__(self, llm: LLMPort) -> None:
        self._llm = llm

    async def synthesize(
        self,
        *,
        url: str,
        company_name: str,
        overall_summary: str,
        evidence: dict[Category, CategoryEvidence],
    ) -> FrameworkBundle:
        signals = "\n\n".join(
            f"### {cat.value}\n{(_clip(evidence[cat].summary_markdown) if cat in evidence else '_(missing)_')}"
            for cat in Category
        )
        user = FRAMEWORKS_USER_TEMPLATE.format(
            name=company_name,
            url=url,
            overall_summary=overall_summary,
            signals=signals,
        )
        data = await self._llm.complete_json(system=FRAMEWORKS_SYSTEM, user=user, max_tokens=8192)

        return FrameworkBundle(
            swot=_listdict(data.get("swot")),
            pestle=_listdict(data.get("pestle")),
            porters={k: str(v) for k, v in (data.get("porters") or {}).items()},
            risk_heatmap={k: int(v) for k, v in (data.get("risk_heatmap") or {}).items()},
            benchmark_kpis=list(data.get("benchmark_kpis") or []),
        )


def _clip(text: str, n: int = 1200) -> str:
    return text if len(text) <= n else text[:n] + "…"


def _listdict(value: object) -> dict[str, list[str]]:
    if not isinstance(value, dict):
        return {}
    return {k: [str(x) for x in (v or [])] for k, v in value.items()}
