"""Domain models for the audit pipeline."""
from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, HttpUrl


class Category(str, Enum):
    LEGITIMACY = "legitimacy"
    FINANCIAL = "financial"
    ONLINE_PRESENCE = "online_presence"
    COMPLIANCE = "compliance"
    SOCIAL_PROOF = "social_proof"
    GROWTH = "growth"


class RiskRating(str, Enum):
    GREEN = "green"
    AMBER = "amber"
    RED = "red"


class AuditRequest(BaseModel):
    url: HttpUrl
    company_name: str | None = None


class CategoryEvidence(BaseModel):
    """Raw, structured evidence collected for a single category."""

    category: Category
    summary_markdown: str
    sources: list[str] = Field(default_factory=list)
    raw: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None


class CategoryScore(BaseModel):
    score: int = Field(ge=0, le=10)
    justification: str


class Discrepancy(BaseModel):
    category: Category
    claim: str
    evidence: str
    severity: str = "med"


class FrameworkBundle(BaseModel):
    swot: dict[str, list[str]]
    pestle: dict[str, list[str]]
    porters: dict[str, str]
    risk_heatmap: dict[str, int]
    benchmark_kpis: list[dict[str, Any]]


class AuditReport(BaseModel):
    company_name: str
    url: str
    overall_risk: RiskRating
    overall_summary: str
    scores: dict[Category, CategoryScore]
    discrepancies: list[Discrepancy]
    frameworks: FrameworkBundle
    evidence: dict[Category, CategoryEvidence]
