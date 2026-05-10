import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

import type { Category, CategoryScore } from "@/types/audit";
import { CATEGORY_LABEL } from "@/types/audit";

interface Props {
  category: Category;
  score: CategoryScore;
}

export function ScoreCard({ category, score }: Props) {
  const target = Math.max(0, Math.min(10, score.score));
  const counter = useMotionValue(0);
  const display = useTransform(counter, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(counter, target, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [counter, target]);

  return (
    <article className="rounded-card bg-sage p-7 flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal">
            {category.replace("_", " ")}
          </div>
          <div className="mt-2 text-heading-sm text-ink">{CATEGORY_LABEL[category]}</div>
        </div>
        <div className="font-mono text-[48px] font-medium leading-none text-ink flex items-baseline">
          <motion.span>{display}</motion.span>
          <span className="text-body-lg text-gunmetal">/10</span>
        </div>
      </div>

      <div className="h-1 w-full bg-stone rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-action"
          initial={{ width: 0 }}
          animate={{ width: `${target * 10}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <p className="text-body text-gunmetal leading-[1.5]">{score.justification}</p>
    </article>
  );
}
