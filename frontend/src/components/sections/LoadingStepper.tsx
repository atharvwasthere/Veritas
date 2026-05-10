import type { AuditStep } from "@/hooks/useAuditStream";

export function LoadingStepper({ steps }: { steps: AuditStep[] }) {
  return (
    <ol className="rounded-card bg-sage px-7 py-7 space-y-4">
      {steps.map((s) => (
        <li key={s.category} className="flex items-center gap-3 text-body text-ink">
          <StatusIcon status={s.status} />
          <span
            className={
              s.status === "done"
                ? "text-gunmetal"
                : s.status === "loading"
                  ? "font-medium"
                  : ""
            }
          >
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function StatusIcon({ status }: { status: AuditStep["status"] }) {
  if (status === "done") {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-ink text-canvas">
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 6.5l2.5 2.5L10 3" />
        </svg>
      </span>
    );
  }
  if (status === "loading") {
    return (
      <span className="inline-block h-4 w-4 rounded-full border-2 border-ink border-t-transparent spin-ring" />
    );
  }
  if (status === "failed") {
    return <span className="inline-block h-4 w-4 rounded-full border border-risk-red bg-canvas" />;
  }
  return <span className="inline-block h-4 w-4 rounded-full border border-concrete bg-canvas" />;
}
