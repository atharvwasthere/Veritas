import { createContext, useContext, type ReactNode } from "react";

import { useAuditStream } from "@/hooks/useAuditStream";

type AuditContextValue = ReturnType<typeof useAuditStream>;

const AuditContext = createContext<AuditContextValue | null>(null);

export function AuditProvider({ children }: { children: ReactNode }) {
  const value = useAuditStream();
  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit(): AuditContextValue {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error("useAudit must be used inside AuditProvider");
  return ctx;
}
