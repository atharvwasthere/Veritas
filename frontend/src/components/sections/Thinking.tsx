import { motion } from "framer-motion";

import { fadeUp, stagger } from "@/lib/motion";

import { SectionHeader } from "../ui/SectionHeader";

interface Card {
  title: string;
  body: string;
  img: string;
}

const CARDS: Card[] = [
  {
    title: "Why public-source diligence wins for pre-seed",
    body:
      "If a claim can't survive a Google search, it won't survive a partner. Veritas front-loads that filter.",
    img: "/img/apple.png",
  },
  {
    title: "Three founders, one source of truth",
    body:
      "Veritas cross-references the team page against LinkedIn, Crunchbase and press to flag identity drift.",
    img: "/img/3heads.png",
  },
  {
    title: "What an enterprise compliance check looks like",
    body:
      "Privacy, terms, security and cookie pages must be substantive — not boilerplate. We score the substance.",
    img: "/img/rome-arch.png",
  },
];

export function Thinking() {
  return (
    <section className="mx-auto max-w-page px-10 pb-section">
      <SectionHeader eyebrow="Our thinking" title="What due diligence actually catches" />
      <motion.div
        variants={stagger(0.05, 0.12)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {CARDS.map((c) => (
          <motion.article
            key={c.title}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            <div className="rounded-card bg-sage h-[260px] flex items-center justify-center overflow-hidden">
              <img
                src={c.img}
                alt=""
                className="max-h-[200px] max-w-[80%] object-contain mix-blend-multiply"
                loading="lazy"
              />
            </div>
            <h4 className="text-heading-sm text-ink">{c.title}</h4>
            <p className="text-body text-gunmetal leading-[1.5]">{c.body}</p>
            <a
              href="#"
              className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink mt-1 inline-flex items-center gap-1 hover:gap-2 transition-all"
            >
              Read note <span aria-hidden>→</span>
            </a>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
