import { motion } from "framer-motion";

import { fadeUp } from "@/lib/motion";

import { Button } from "../ui/Button";

interface Props {
  onExport: () => void;
  disabled?: boolean;
}

export function ExportCta({ onExport, disabled }: Props) {
  return (
    <section className="mx-auto max-w-page px-10 pb-section">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="rounded-card bg-sage p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center overflow-hidden"
      >
        <div className="lg:col-span-7">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-gunmetal mb-3">
            Export
          </div>
          <h3 className="text-heading-lg text-ink">One report, full diligence.</h3>
          <p className="mt-3 text-body-lg text-gunmetal leading-[1.5] max-w-[520px]">
            Five-slide PPTX with the verdict, scorecards, top discrepancies, SWOT and PESTLE —
            generated client-side. No backend storage, no shared links, your audit never leaves
            the browser.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="primary" onClick={onExport} disabled={disabled}>
              Download report
            </Button>
            <Button variant="ghost" onClick={() => window.print()}>
              Print to PDF
            </Button>
          </div>
        </div>
        <div className="lg:col-span-5">
          <motion.img
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            src="/img/bull.avif"
            alt="Charging bull"
            className="w-full h-[260px] object-contain mix-blend-multiply"
          />
        </div>
      </motion.div>
    </section>
  );
}
