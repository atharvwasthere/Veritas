import type { RiskRating } from "@/types/audit";

const DOT: Record<RiskRating, string> = {
  green: "bg-risk-green",
  amber: "bg-risk-amber",
  red: "bg-risk-red",
};

const LABEL: Record<RiskRating, string> = {
  green: "Low risk",
  amber: "Medium risk",
  red: "High risk",
};

export function RiskBadge({ value }: { value: RiskRating }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-pill bg-sage px-5 py-2 font-mono text-[13px] font-medium text-ink">
      <span className={`h-2 w-2 rounded-full ${DOT[value]}`} />
      {LABEL[value]}
    </span>
  );
}
