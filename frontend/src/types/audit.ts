// Domain types mirroring backend models. One source of truth for UI.

export type Category =
  | "legitimacy"
  | "financial"
  | "online_presence"
  | "compliance"
  | "social_proof"
  | "growth";

export const CATEGORIES: Category[] = [
  "legitimacy",
  "financial",
  "online_presence",
  "compliance",
  "social_proof",
  "growth",
];

export const CATEGORY_LABEL: Record<Category, string> = {
  legitimacy: "Legitimacy",
  financial: "Financial",
  online_presence: "Online Presence",
  compliance: "Compliance",
  social_proof: "Social Proof",
  growth: "Growth",
};

export type RiskRating = "green" | "amber" | "red";

export interface CategoryScore {
  score: number;
  justification: string;
}

export interface Discrepancy {
  category: Category;
  claim: string;
  evidence: string;
  severity: "low" | "med" | "high";
}

export interface FrameworkBundle {
  swot: Record<string, string[]>;
  pestle: Record<string, string[]>;
  porters: Record<string, string>;
  risk_heatmap: Record<string, number>;
  benchmark_kpis: Array<Record<string, string>>;
}

export interface CategoryEvidence {
  category: Category;
  summary_markdown: string;
  sources: string[];
  raw: Record<string, unknown>;
  error: string | null;
}

export interface AuditReport {
  company_name: string;
  url: string;
  overall_risk: RiskRating;
  overall_summary: string;
  scores: Record<Category, CategoryScore>;
  discrepancies: Discrepancy[];
  frameworks: FrameworkBundle;
  evidence: Record<Category, CategoryEvidence>;
}

export type StreamEvent =
  | { type: "started"; url: string }
  | { type: "extractor"; category: Category; phase: "started" | "completed" | "failed"; detail: string }
  | { type: "report"; data: AuditReport }
  | { type: "error"; message: string };
