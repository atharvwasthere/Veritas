import { Link, Navigate } from "react-router-dom";

import { useAudit } from "@/lib/auditContext";
import { exportAuditDeck } from "@/lib/pptxExport";

import { Button } from "@/components/ui/Button";
import { FrameworksPanel } from "@/components/sections/FrameworksPanel";
import { ExportCta } from "@/components/sections/ExportCta";

export function Frameworks() {
  const { report } = useAudit();
  if (!report) return <Navigate to="/" replace />;

  const onExport = () => exportAuditDeck(report).catch(console.error);

  return (
    <div className="pt-12">
      <div className="mx-auto max-w-page px-10 mb-6 flex items-center justify-between">
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-gunmetal">
          /audit/frameworks
        </div>
        <Link to="/audit/scores">
          <Button variant="ghost">← Scores</Button>
        </Link>
      </div>
      <FrameworksPanel data={report.frameworks} />
      <ExportCta onExport={onExport} />
    </div>
  );
}
