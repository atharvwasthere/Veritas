import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useAudit } from "@/lib/auditContext";
import { exportAuditDeck } from "@/lib/pptxExport";
import { fadeUp, stagger } from "@/lib/motion";

import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { LoadingStepper } from "@/components/sections/LoadingStepper";

export function AuditOverview() {
  const { isRunning, steps, report, error } = useAudit();

  if (!isRunning && !report && !error) return <Navigate to="/" replace />;

  return (
    <section className="mx-auto max-w-page px-10 pt-16 pb-section">
      <motion.div variants={stagger(0, 0.08)} initial="hidden" animate="show">
        <motion.div
          variants={fadeUp}
          className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-gunmetal mb-4"
        >
          /audit
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="text-display-sm font-medium tracking-[-0.02em] text-ink"
        >
          {report ? report.company_name : "Auditing in progress…"}
        </motion.h1>
        {report ? (
          <motion.p variants={fadeUp} className="mt-4 text-body-lg text-gunmetal max-w-[680px]">
            {report.overall_summary}
          </motion.p>
        ) : null}

        <motion.div variants={fadeUp} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <LoadingStepper steps={steps} />
          </div>
          <div className="lg:col-span-4 rounded-card bg-sage p-7 flex flex-col justify-between">
            <div>
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal mb-3">
                Verdict
              </div>
              {report ? (
                <RiskBadge value={report.overall_risk} />
              ) : (
                <div className="text-body text-gunmetal">Calculating risk…</div>
              )}
              {report ? (
                <p className="mt-4 font-mono text-body-sm text-gunmetal">
                  {report.discrepancies.length} discrepancies surfaced
                </p>
              ) : null}
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Link to="/audit/scores">
                <Button variant="primary" disabled={!report} className="w-full">
                  View scores
                </Button>
              </Link>
              <Link to="/audit/frameworks">
                <Button variant="ghost" disabled={!report} className="w-full">
                  View frameworks
                </Button>
              </Link>
              <Button
                variant="ghost"
                disabled={!report}
                className="w-full"
                onClick={() => report && exportAuditDeck(report).catch(console.error)}
              >
                Download PPTX
              </Button>
            </div>
          </div>
        </motion.div>

        {error ? (
          <motion.div
            variants={fadeUp}
            className="mt-6 rounded-medium border border-stone bg-canvas px-5 py-4 text-body text-risk-red"
          >
            {error}
          </motion.div>
        ) : null}
      </motion.div>
    </section>
  );
}
