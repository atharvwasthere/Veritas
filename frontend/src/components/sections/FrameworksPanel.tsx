import { useState } from "react";

import type { FrameworkBundle } from "@/types/audit";

import { SectionHeader } from "../ui/SectionHeader";

type Tab = "swot" | "pestle" | "porters" | "heatmap";

const TABS: { id: Tab; label: string }[] = [
  { id: "swot", label: "SWOT" },
  { id: "pestle", label: "PESTLE" },
  { id: "porters", label: "Porter's 5" },
  { id: "heatmap", label: "Risk Heatmap" },
];

export function FrameworksPanel({ data }: { data: FrameworkBundle }) {
  const [tab, setTab] = useState<Tab>("swot");

  return (
    <section id="frameworks" className="mx-auto max-w-page px-10 pb-section">
      <SectionHeader
        eyebrow="Frameworks"
        title="Strategic context, auto-synthesized"
        subtitle="Claude reads the full audit evidence and produces partner-ready frameworks. No second API call, no extra wait."
      />

      <div className="border-b border-stone mb-0 flex gap-8">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "py-3 text-body transition-colors border-b-2 -mb-px " +
                (active
                  ? "text-ink font-medium border-ink"
                  : "text-gunmetal border-transparent hover:text-ink")
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-b-card rounded-tr-card bg-sage p-8">
        {tab === "swot" && <Swot data={data.swot} />}
        {tab === "pestle" && <Pestle data={data.pestle} />}
        {tab === "porters" && <Porters data={data.porters} />}
        {tab === "heatmap" && <Heatmap data={data.risk_heatmap} />}
      </div>
    </section>
  );
}

function Swot({ data }: { data: Record<string, string[]> }) {
  const cells: Array<[string, string[]]> = [
    ["Strengths", data.strengths || []],
    ["Weaknesses", data.weaknesses || []],
    ["Opportunities", data.opportunities || []],
    ["Threats", data.threats || []],
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {cells.map(([label, items]) => (
        <div key={label}>
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal mb-3">
            {label}
          </div>
          <ul className="space-y-2">
            {items.map((it, i) => (
              <li key={i} className="text-body text-ink leading-[1.5]">— {it}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Pestle({ data }: { data: Record<string, string[]> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-y-3 gap-x-8">
      {Object.entries(data).map(([factor, items]) => (
        <div key={factor} className="contents">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal pt-1">
            {factor}
          </div>
          <ul className="space-y-1">
            {(items || []).map((it, i) => (
              <li key={i} className="text-body text-ink leading-[1.5]">— {it}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Porters({ data }: { data: Record<string, string> }) {
  const order = ["rivalry", "new_entrants", "substitutes", "buyer_power", "supplier_power"];
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-y-3 gap-x-8">
      {order.map((k) => (
        <div key={k} className="contents">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal pt-1">
            {k.replace("_", " ")}
          </div>
          <p className="text-body text-ink leading-[1.5]">{data[k] || "—"}</p>
        </div>
      ))}
    </div>
  );
}

function Heatmap({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {entries.map(([k, v]) => (
        <div key={k}>
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal">
              {k}
            </span>
            <span className="font-mono text-body-lg text-ink">{v}/10</span>
          </div>
          <div className="h-2 w-full bg-stone rounded-full overflow-hidden">
            <div className="h-full bg-action" style={{ width: `${v * 10}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
