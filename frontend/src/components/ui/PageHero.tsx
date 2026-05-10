import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { fadeUp, stagger } from "@/lib/motion";

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
}

export function PageHero({ eyebrow, title, subtitle, image, imageAlt = "", children }: Props) {
  return (
    <section className="mx-auto max-w-page px-10 pt-16 pb-section">
      <motion.div
        variants={stagger(0.05, 0.1)}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
      >
        <div className={image ? "lg:col-span-7" : "lg:col-span-12"}>
          <motion.div
            variants={fadeUp}
            className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-gunmetal mb-6"
          >
            {eyebrow}
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-display-sm lg:text-[56px] font-medium text-ink leading-[1.05] tracking-[-0.03em]"
          >
            {title}
          </motion.h1>
          {subtitle ? (
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-[560px] text-body-lg text-gunmetal leading-[1.5]"
            >
              {subtitle}
            </motion.p>
          ) : null}
          {children ? (
            <motion.div variants={fadeUp} className="mt-8">
              {children}
            </motion.div>
          ) : null}
        </div>
        {image ? (
          <motion.div variants={fadeUp} className="lg:col-span-5">
            <div className="rounded-card bg-sage flex items-center justify-center p-10 min-h-[380px]">
              <img
                src={image}
                alt={imageAlt}
                className="max-h-[320px] max-w-full object-contain mix-blend-multiply"
              />
            </div>
          </motion.div>
        ) : null}
      </motion.div>
    </section>
  );
}
