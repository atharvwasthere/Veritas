"""Turns CategoryEvidence into per-category scores + discrepancies + risk verdict."""
from __future__ import annotations

from app.clients.llm import LLMPort
from app.models.audit import (
    Category,
    CategoryEvidence,
    CategoryScore,
    Discrepancy,
    RiskRating,
)

from .prompts import SCORING_SYSTEM, SCORING_USER_TEMPLATE


class ScoringResult:
    def __init__(
        self,
        *,
        company_name: str,
        overall_risk: RiskRating,
        overall_summary: str,
        scores: dict[Category, CategoryScore],
        discrepancies: list[Discrepancy],
    ) -> None:
        self.company_name = company_name
        self.overall_risk = overall_risk
        self.overall_summary = overall_summary
        self.scores = scores
        self.discrepancies = discrepancies


class ScoringAnalyzer:
    def __init__(self, llm: LLMPort) -> None:
        self._llm = llm

    async def score(
        self,
        *,
        url: str,
        company_name: str,
        evidence: dict[Category, CategoryEvidence],
    ) -> ScoringResult:
        user = SCORING_USER_TEMPLATE.format(
            name=company_name,
            url=url,
            legitimacy=_section(evidence, Category.LEGITIMACY),
            financial=_section(evidence, Category.FINANCIAL),
            online_presence=_section(evidence, Category.ONLINE_PRESENCE),
            compliance=_section(evidence, Category.COMPLIANCE),
            social_proof=_section(evidence, Category.SOCIAL_PROOF),
            growth=_section(evidence, Category.GROWTH),
        )
        data = await self._llm.complete_json(system=SCORING_SYSTEM, user=user, max_tokens=6000)

        scores: dict[Category, CategoryScore] = {}
        for cat in Category:
            entry = (data.get("scores") or {}).get(cat.value, {}) or {}
            scores[cat] = CategoryScore(
                score=int(entry.get("score", 0)),
                justification=str(entry.get("justification", "")),
            )

        discrepancies = [
            Discrepancy(
                category=Category(d.get("category", Category.LEGITIMACY.value)),
                claim=str(d.get("claim", "")),
                evidence=str(d.get("evidence", "")),
                severity=str(d.get("severity", "med")),
            )
            for d in data.get("discrepancies", []) or []
            if d.get("category") in {c.value for c in Category}
        ]

        return ScoringResult(
            company_name=str(data.get("company_name") or company_name),
            overall_risk=RiskRating(data.get("overall_risk", "amber")),
            overall_summary=str(data.get("overall_summary", "")),
            scores=scores,
            discrepancies=discrepancies,
        )


def _section(evidence: dict[Category, CategoryEvidence], cat: Category) -> str:
    ev = evidence.get(cat)
    return ev.summary_markdown if ev else "_(missing)_"
