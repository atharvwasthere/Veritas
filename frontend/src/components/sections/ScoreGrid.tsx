import { motion } from "framer-motion";

import type { AuditReport } from "@/types/audit";
import { CATEGORIES } from "@/types/audit";
import { fadeUp, stagger } from "@/lib/motion";

import { RiskBadge } from "../ui/RiskBadge";
import { SectionHeader } from "../ui/SectionHeader";

import { ScoreCard } from "./ScoreCard";

export function ScoreGrid({ report }: { report: AuditReport }) {
  return (
    <section id="scores" className="mx-auto max-w-page px-10 pb-section">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <SectionHeader
          eyebrow={report.company_name}
          title="Six categories. One verdict."
          subtitle={report.overall_summary}
        />
        <RiskBadge value={report.overall_risk} />
      </div>
      <motion.div
        variants={stagger(0.05, 0.08)}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {CATEGORIES.map((cat) => (
          <motion.div key={cat} variants={fadeUp}>
            <ScoreCard category={cat} score={report.scores[cat]} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
