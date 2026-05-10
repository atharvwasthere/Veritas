import { useCallback, useRef, useState } from "react";

import { streamAudit } from "@/lib/api";
import type { AuditReport, Category, StreamEvent } from "@/types/audit";

export type StepStatus = "pending" | "loading" | "done" | "failed";

export interface AuditStep {
  category: Category;
  label: string;
  status: StepStatus;
}

const DEFAULT_STEPS: AuditStep[] = [
  { category: "legitimacy", label: "Verifying team & founders", status: "pending" },
  { category: "financial", label: "Researching funding & revenue signals", status: "pending" },
  { category: "online_presence", label: "Scanning press & media coverage", status: "pending" },
  { category: "compliance", label: "Crawling legal & compliance pages", status: "pending" },
  { category: "social_proof", label: "Cross-checking customers & reviews", status: "pending" },
  { category: "growth", label: "Reading hiring & product momentum", status: "pending" },
];

interface State {
  isRunning: boolean;
  steps: AuditStep[];
  report: AuditReport | null;
  error: string | null;
}

export function useAuditStream() {
  const [state, setState] = useState<State>({
    isRunning: false,
    steps: DEFAULT_STEPS,
    report: null,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ isRunning: false, steps: DEFAULT_STEPS, report: null, error: null });
  }, []);

  const start = useCallback(async (url: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ isRunning: true, steps: DEFAULT_STEPS, report: null, error: null });

    try {
      for await (const ev of streamAudit(url, controller.signal)) {
        setState((s) => reduce(s, ev));
      }
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return;
      setState((s) => ({ ...s, isRunning: false, error: (e as Error).message }));
    } finally {
      setState((s) => ({ ...s, isRunning: false }));
    }
  }, []);

  return { ...state, start, reset };
}

function reduce(state: State, ev: StreamEvent): State {
  switch (ev.type) {
    case "started":
      return { ...state, isRunning: true };
    case "extractor": {
      const status: StepStatus =
        ev.phase === "started" ? "loading" : ev.phase === "completed" ? "done" : "failed";
      return {
        ...state,
        steps: state.steps.map((s) =>
          s.category === ev.category ? { ...s, status } : s
        ),
      };
    }
    case "report":
      return { ...state, report: ev.data, isRunning: false };
    case "error":
      return { ...state, error: ev.message, isRunning: false };
    default:
      return state;
  }
}
