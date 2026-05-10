import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { InfoGrid, type InfoCard } from "@/components/sections/InfoGrid";

const CARDS: InfoCard[] = [
  {
    number: "01",
    eyebrow: "Legitimacy",
    title: "Is the team real?",
    body:
      "Cross-checks the team page and founder names against LinkedIn presence, press mentions and registration signals. Flags missing bios, stock photos, and ghost cofounders.",
    meta: "URL Scraper · Search API",
  },
  {
    number: "02",
    eyebrow: "Financial signals",
    title: "Does the funding story hold up?",
    body:
      "Compares the company's funding claims against news coverage, then triangulates revenue and valuation signals from public reporting.",
    meta: "Agentic Search · Search API",
  },
  {
    number: "03",
    eyebrow: "Online presence",
    title: "Are the press and SEO real?",
    body:
      "Maps press coverage breadth across Tier-1 and Tier-2 outlets, then reads the on-site media page to detect re-syndication or self-published filler.",
    meta: "Search API · URL Scraper",
  },
  {
    number: "04",
    eyebrow: "Compliance",
    title: "Are the legal pages substantive?",
    body:
      "Crawls privacy, terms, security and cookie pages. Boilerplate templates score lower than substantive, jurisdiction-specific policies — we read the substance.",
    meta: "Crawl API",
  },
  {
    number: "05",
    eyebrow: "Social proof",
    title: "Do the customer logos check out?",
    body:
      "Cross-references the customers page against case studies, G2 reviews, Capterra and Trustpilot. Detects logo-walls of companies that have never publicly endorsed.",
    meta: "URL Scraper · Search API",
  },
  {
    number: "06",
    eyebrow: "Growth signals",
    title: "Is momentum genuine?",
    body:
      "Reads the careers page for hiring velocity and runs an agentic research pass on recent product launches, partnerships and team additions.",
    meta: "URL Scraper · Agentic Search",
  },
];

export function ScoresInfo() {
  return (
    <>
      <PageHero
        eyebrow="Scoring framework"
        title="Six categories. Zero ambiguity."
        subtitle="Veritas scores every company across the six dimensions a partner will ask about anyway. Each score 0–10 carries a two-sentence justification grounded in scraped public evidence — no vibes."
        image="/img/bull.avif"
        imageAlt="Charging bull illustration"
      >
        <Link to="/">
          <Button variant="primary">Run an audit</Button>
        </Link>
      </PageHero>

      <InfoGrid cards={CARDS} columns={3} />

      <section className="mx-auto max-w-page px-10 pb-section">
        <div className="rounded-card bg-sage px-10 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal mb-3">
              Aggregate verdict
            </div>
            <h3 className="text-heading-lg text-ink">Green, amber, or red.</h3>
            <p className="mt-3 text-body-lg text-gunmetal leading-[1.5] max-w-[520px]">
              Six scores roll up into a single risk rating. Green clears for a partner read.
              Amber flags follow-up questions. Red is a do-not-progress signal — backed by
              concrete claim-vs-evidence discrepancies.
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-3 gap-3">
            <Verdict color="bg-risk-green" label="Green" caption="Cleared" />
            <Verdict color="bg-risk-amber" label="Amber" caption="Follow-up" />
            <Verdict color="bg-risk-red" label="Red" caption="Hard pass" />
          </div>
        </div>
      </section>
    </>
  );
}

function Verdict({ color, label, caption }: { color: string; label: string; caption: string }) {
  return (
    <div className="rounded-medium bg-canvas px-4 py-5 flex flex-col gap-3 items-start">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <div>
        <div className="font-mono text-body-sm text-ink">{label}</div>
        <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-gunmetal mt-1">
          {caption}
        </div>
      </div>
    </div>
  );
}
