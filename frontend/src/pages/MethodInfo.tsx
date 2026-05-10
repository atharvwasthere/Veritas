import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { fadeUp, stagger } from "@/lib/motion";

interface Row {
  category: string;
  apis: string;
  detail: string;
}

const PIPELINE: Row[] = [
  {
    category: "Legitimacy",
    apis: "URL Scraper · Search API",
    detail: "Team/about page → founder LinkedIn cross-check.",
  },
  {
    category: "Financial",
    apis: "Agentic Search · Search API",
    detail: "Multi-stage funding research → revenue/valuation signals.",
  },
  {
    category: "Online presence",
    apis: "Search API · URL Scraper",
    detail: "Press coverage breadth → on-site media page substance.",
  },
  {
    category: "Compliance",
    apis: "Crawl API",
    detail: "Privacy / terms / security / cookie pages — read for substance.",
  },
  {
    category: "Social proof",
    apis: "URL Scraper · Search API",
    detail: "Customer logos → G2, Capterra, Trustpilot triangulation.",
  },
  {
    category: "Growth",
    apis: "URL Scraper · Agentic Search",
    detail: "Careers page hiring velocity → product/momentum research.",
  },
];

export function MethodInfo() {
  return (
    <>
      <PageHero
        eyebrow="Method"
        title="Public-source diligence, end to end."
        subtitle="Six parallel evidence extractors hit Anakin's primitives. Claude reads the structured output, scores six categories, and writes the frameworks. Nothing is fetched at synthesis time — clean separation."
        image="/img/apple.png"
        imageAlt="Apple illustration"
      >
        <Link to="/">
          <Button variant="primary">Run an audit</Button>
        </Link>
      </PageHero>

      <section className="mx-auto max-w-page px-10 pb-section">
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-gunmetal mb-6">
          Anakin → category mapping
        </div>
        <motion.div
          variants={stagger(0.04, 0.06)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="rounded-card bg-sage divide-y divide-stone overflow-hidden"
        >
          {PIPELINE.map((r, i) => (
            <motion.div
              key={r.category}
              variants={fadeUp}
              className="grid grid-cols-12 gap-6 px-7 py-6 items-center"
            >
              <div className="col-span-1 font-mono text-body-lg text-ink">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="col-span-3 text-heading-sm text-ink">{r.category}</div>
              <div className="col-span-4 font-mono text-body-sm text-gunmetal">
                {r.apis}
              </div>
              <div className="col-span-4 text-body text-gunmetal leading-[1.5]">
                {r.detail}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-page px-10 pb-section grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Block
          eyebrow="Extraction"
          title="Six concurrent extractors"
          body="Each category has a single-responsibility extractor. They run in parallel under a semaphore, isolated from one another — a failed compliance crawl never blocks the legitimacy verdict."
        />
        <Block
          eyebrow="Synthesis"
          title="Two Claude prompts"
          body="One prompt scores six categories and surfaces discrepancies. A second prompt synthesizes SWOT, PESTLE, Porter's, the risk heatmap and KPI benchmarks — both as strict JSON, both grounded in the scraped evidence."
        />
        <Block
          eyebrow="Architecture"
          title="Planner → Worker → Analyzer"
          body="A planner picks the right extractors per request. A worker runs them concurrently and emits SSE progress. Analyzers turn evidence into scores and frameworks. New audit category = one new file."
        />
        <Block
          eyebrow="Output"
          title="Strict JSON, client export"
          body="The backend returns structured JSON only. The frontend renders the dashboard and generates the five-slide PPTX entirely in the browser via PptxGenJS — no server-side file handling."
        />
      </section>
    </>
  );
}

function Block({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      className="rounded-card bg-sage p-7"
    >
      <div className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal mb-3">
        {eyebrow}
      </div>
      <h4 className="text-heading-sm text-ink">{title}</h4>
      <p className="mt-3 text-body text-gunmetal leading-[1.5]">{body}</p>
    </motion.div>
  );
}
