import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { InfoGrid, type InfoCard } from "@/components/sections/InfoGrid";

const CARDS: InfoCard[] = [
  {
    eyebrow: "Macro",
    title: "PESTLE",
    body:
      "Political, economic, social, technological, legal, environmental — the macro lens partners apply before any IPO or acquisition narrative. Generated from scraped evidence, not template prose.",
    meta: "6 axes · Concrete factors",
  },
  {
    eyebrow: "Health",
    title: "SWOT",
    body:
      "Strengths and weaknesses pulled from team and product evidence. Opportunities and threats grounded in the press coverage and competitor research surfaced during extraction.",
    meta: "2×2 grid",
  },
  {
    eyebrow: "Competitive",
    title: "Porter's 5 Forces",
    body:
      "Rivalry, new entrants, substitutes, buyer and supplier power — applied to the company's actual market and named competitors, not generic industry boilerplate.",
    meta: "5 forces · Named competitors",
  },
  {
    eyebrow: "Risk",
    title: "Risk Heatmap",
    body:
      "Compliance, financial, operational and market risk scored 0–10 each. The fastest single view of where the company is exposed and where it isn't.",
    meta: "4 axes · 0–10 scale",
  },
  {
    eyebrow: "Benchmarks",
    title: "Sector KPIs",
    body:
      "Headcount growth, hiring velocity, social proof depth — benchmarked against sector medians. Above, in-line, or below — with the numbers that justify the verdict.",
    meta: "Sector medians",
  },
  {
    eyebrow: "Synthesis",
    title: "One Claude pass",
    body:
      "All five frameworks generated in a single Claude call from the structured Anakin evidence. No extra API roundtrip per framework — minutes saved compound across 20 audits a week.",
    meta: "Single LLM call",
  },
];

export function FrameworksInfo() {
  return (
    <>
      <PageHero
        eyebrow="Analytical frameworks"
        title="MBB-grade frameworks, auto-synthesized."
        subtitle="Five frameworks every partner expects in a memo, generated from the same Anakin evidence in a single Claude pass. Concrete, named, and grounded — never templated filler."
        image="/img/rome-arch.png"
        imageAlt="Roman arch illustration"
      >
        <Link to="/">
          <Button variant="primary">Run an audit</Button>
        </Link>
      </PageHero>

      <InfoGrid cards={CARDS} columns={3} />

      <section className="mx-auto max-w-page px-10 pb-section">
        <div className="rounded-card bg-sage px-10 py-12">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal mb-3">
            Why one synthesis pass
          </div>
          <h3 className="text-heading-lg text-ink max-w-[760px]">
            Frameworks aren't independent — they share evidence. Veritas reads everything once
            and writes everything once.
          </h3>
          <p className="mt-4 text-body-lg text-gunmetal leading-[1.5] max-w-[680px]">
            Generating SWOT, PESTLE, Porter's, the heatmap and KPI benchmarks in five separate
            LLM calls would multiply latency and cost without improving quality. A single
            structured pass keeps frameworks internally consistent and cuts wall-clock time by
            roughly four minutes per audit.
          </p>
        </div>
      </section>
    </>
  );
}
