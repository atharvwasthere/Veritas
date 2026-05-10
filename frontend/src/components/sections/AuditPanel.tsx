import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import type { AuditStep } from "@/hooks/useAuditStream";
import type { AuditReport } from "@/types/audit";
import { fadeUp } from "@/lib/motion";

import { Button } from "../ui/Button";
import { RiskBadge } from "../ui/RiskBadge";

import { LoadingStepper } from "./LoadingStepper";

interface Props {
  isRunning: boolean;
  steps: AuditStep[];
  report: AuditReport | null;
  error: string | null;
  onExport: () => void;
}

export function AuditPanel({ isRunning, steps, report, error, onExport }: Props) {
  const hasActivity = isRunning || report || error;
  if (!hasActivity) return null;

  return (
    <section className="mx-auto max-w-page px-10 pb-section">
      <AnimatePresence mode="wait">
        {isRunning || error ? (
          <motion.div
            key="live"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
          >
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal mb-3">
              Live pipeline
            </div>
            <LoadingStepper steps={steps} />
            {error ? (
              <div className="mt-4 rounded-medium border border-stone bg-canvas px-5 py-4 text-body text-risk-red">
                {error}
              </div>
            ) : null}
          </motion.div>
        ) : null}

        {report && !isRunning ? (
          <motion.div
            key="ready"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-card bg-sage p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-8">
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal mb-3">
                Audit complete · {report.company_name}
              </div>
              <h3 className="text-heading-lg text-ink">{report.overall_summary}</h3>
              <div className="mt-5 flex items-center gap-3">
                <RiskBadge value={report.overall_risk} />
                <span className="font-mono text-body-sm text-gunmetal">
                  {report.discrepancies.length} discrepancies surfaced
                </span>
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link to="/audit/scores">
                <Button variant="primary" className="w-full">
                  View scores
                </Button>
              </Link>
              <Link to="/audit/frameworks">
                <Button variant="ghost" className="w-full">
                  View frameworks
                </Button>
              </Link>
              <Button variant="ghost" onClick={onExport} className="w-full">
                Download PPTX
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
