import { motion } from "framer-motion";

import { fadeUp, stagger } from "@/lib/motion";

import { UrlInput } from "../ui/UrlInput";

interface Props {
  onSubmit: (url: string) => void;
  isRunning: boolean;
}

export function Hero({ onSubmit, isRunning }: Props) {
  return (
    <section className="mx-auto max-w-page px-10 pt-16 pb-section">
      <motion.div
        variants={stagger(0.1, 0.12)}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
      >
        <div className="lg:col-span-7">
          <motion.div
            variants={fadeUp}
            className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-gunmetal mb-6"
          >
            Build with Anakin · Hackathon 2026
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-[44px] sm:text-display-sm lg:text-display font-medium text-ink leading-[1.05] tracking-[-0.03em]"
          >
            The diligence engine for high-stakes investment decisions.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-[520px] text-body-lg text-gunmetal leading-[1.5]"
          >
            Veritas cross-verifies the team, traction, compliance, and growth claims of any
            company — in three minutes, not three weeks. Drop in a URL.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8">
            <UrlInput onSubmit={onSubmit} disabled={isRunning} />
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="mt-4 flex items-center gap-2 text-body-sm text-gunmetal"
          >
            <span className="h-1 w-1 rounded-full bg-accent" />
            Trusted public sources only · 100% Anakin pipeline
          </motion.div>
        </div>

        <motion.div variants={fadeUp} className="lg:col-span-5">
          <div className="rounded-card flex items-center justify-center p-8 min-h-[420px]">
            <motion.img
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              src="/img/hero.avif"
              alt="Skyline illustration"
              className="w-full h-auto max-h-[460px] object-contain mix-blend-multiply"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
