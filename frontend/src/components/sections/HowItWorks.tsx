import { motion } from "framer-motion";

import { fadeUp, stagger } from "@/lib/motion";

import { SectionHeader } from "../ui/SectionHeader";

interface Row {
  n: string;
  title: string;
  body: string;
}

const ROWS: Row[] = [
  {
    n: "1",
    title: "Drop in a URL",
    body:
      "Veritas parses the domain, infers the company, and queues six parallel evidence extractors against Anakin.",
  },
  {
    n: "2",
    title: "Anakin scrapes the web",
    body:
      "URL Scraper, Search, Agentic Search and Crawl run concurrently — team page, press, legal docs, customer logos, careers.",
  },
  {
    n: "3",
    title: "Claude scores and cross-checks",
    body:
      "Claude reads the structured evidence, scores 6 audit categories 0–10, and surfaces concrete claim-vs-evidence discrepancies.",
  },
  {
    n: "4",
    title: "Export an enterprise PPTX",
    body:
      "One click ships a partner-ready deck: SWOT, PESTLE, Porter's, risk heatmap, top discrepancies — generated client-side.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-page px-10 pb-section">
      <SectionHeader
        eyebrow="How it works"
        title="From URL to partner-ready in three minutes"
      />
      <motion.div
        variants={stagger(0, 0.08)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="rounded-card bg-sage divide-y divide-stone overflow-hidden"
      >
        {ROWS.map((r) => (
          <motion.div
            key={r.n}
            variants={fadeUp}
            className="grid grid-cols-12 gap-6 px-7 py-7"
          >
            <div className="col-span-1 font-mono text-body-lg text-ink">{r.n}</div>
            <div className="col-span-4 text-heading-sm text-ink">{r.title}</div>
            <div className="col-span-7 text-body-lg text-gunmetal leading-[1.5]">
              {r.body}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
