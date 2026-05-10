import { useRef } from "react";

import { useAudit } from "@/lib/auditContext";
import { exportAuditDeck } from "@/lib/pptxExport";

import { Hero } from "@/components/sections/Hero";
import { StatStrip } from "@/components/sections/StatStrip";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { AuditPanel } from "@/components/sections/AuditPanel";
import { Thinking } from "@/components/sections/Thinking";

export function Landing() {
  const { isRunning, steps, report, error, start } = useAudit();
  const heroRef = useRef<HTMLDivElement>(null);

  const onExport = () => {
    if (report) exportAuditDeck(report).catch(console.error);
  };

  return (
    <>
      <div ref={heroRef}>
        <Hero onSubmit={start} isRunning={isRunning} />
      </div>
      <StatStrip />
      <HowItWorks />
      <AuditPanel
        isRunning={isRunning}
        steps={steps}
        report={report}
        error={error}
        onExport={onExport}
      />
      <Thinking />
    </>
  );
}
