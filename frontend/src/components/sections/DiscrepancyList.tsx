import { motion } from "framer-motion";

import type { Discrepancy } from "@/types/audit";
import { CATEGORY_LABEL } from "@/types/audit";
import { fadeUp, stagger } from "@/lib/motion";

import { SectionHeader } from "../ui/SectionHeader";

export function DiscrepancyList({ items }: { items: Discrepancy[] }) {
  return (
    <section className="mx-auto max-w-page px-10 pb-section">
      <SectionHeader
        eyebrow="Discrepancies"
        title="Where the story stops adding up"
        subtitle="Concrete claim-vs-evidence flags surfaced from public sources. Severity reflects how far the public record diverges from the company's stated claim."
      />
      {items.length === 0 ? (
        <div className="rounded-card bg-sage px-7 py-7 text-body-lg text-gunmetal">
          No material discrepancies surfaced. The public record is consistent with company claims.
        </div>
      ) : (
        <motion.ul
          variants={stagger(0.05, 0.08)}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {items.map((d, i) => (
            <motion.li
              key={i}
              variants={fadeUp}
              className="relative bg-canvas border border-stone rounded-medium px-6 py-5 pl-[26px]"
            >
              <span
                className="absolute left-0 top-3 bottom-3 w-[3px] bg-accent rounded-full"
                aria-hidden
              />
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal bg-stone rounded-small px-2 py-0.5">
                  {CATEGORY_LABEL[d.category]}
                </span>
                <span className="font-mono text-[11px] font-medium uppercase text-gunmetal">
                  {d.severity}
                </span>
              </div>
              <p className="text-body font-medium text-ink">{d.claim}</p>
              <p className="mt-1 text-body text-gunmetal leading-[1.5]">{d.evidence}</p>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  );
}
