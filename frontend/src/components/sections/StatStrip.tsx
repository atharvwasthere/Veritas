import { motion } from "framer-motion";

import { fadeUp, stagger } from "@/lib/motion";

interface Stat {
  label: string;
  value: string;
  suffix?: string;
}

const STATS: Stat[] = [
  { label: "Avg audit time", value: "3", suffix: "min" },
  { label: "Public sources cross-checked", value: "8+" },
  { label: "Hours saved per company", value: "4" },
];

export function StatStrip() {
  return (
    <section className="mx-auto max-w-page px-10 pb-section">
      <motion.div
        variants={stagger(0.1, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {STATS.map((s) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            className="rounded-card bg-sage px-7 py-9"
          >
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal">
              {s.label}
            </div>
            <div className="mt-6 flex items-baseline gap-2">
              <div className="font-mono text-[48px] font-medium leading-none text-ink">
                {s.value}
              </div>
              {s.suffix ? (
                <div className="font-mono text-body-lg text-gunmetal">{s.suffix}</div>
              ) : null}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
