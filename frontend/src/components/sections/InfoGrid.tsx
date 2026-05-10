import { motion } from "framer-motion";

import { fadeUp, stagger } from "@/lib/motion";

export interface InfoCard {
  number?: string;
  eyebrow: string;
  title: string;
  body: string;
  meta?: string;
}

interface Props {
  cards: InfoCard[];
  columns?: 2 | 3;
}

export function InfoGrid({ cards, columns = 3 }: Props) {
  const grid =
    columns === 3
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "grid grid-cols-1 md:grid-cols-2 gap-6";

  return (
    <section className="mx-auto max-w-page px-10 pb-section">
      <motion.div
        variants={stagger(0.05, 0.08)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className={grid}
      >
        {cards.map((c, i) => (
          <motion.article
            key={c.title + i}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-card bg-sage p-7 flex flex-col gap-4 min-h-[240px]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal">
                {c.eyebrow}
              </span>
              {c.number ? (
                <span className="font-mono text-[28px] font-medium text-ink leading-none">
                  {c.number}
                </span>
              ) : null}
            </div>
            <h3 className="text-heading-sm text-ink">{c.title}</h3>
            <p className="text-body text-gunmetal leading-[1.5] flex-1">{c.body}</p>
            {c.meta ? (
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-gunmetal pt-2 border-t border-stone">
                {c.meta}
              </div>
            ) : null}
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
