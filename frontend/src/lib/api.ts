import type { AuditReport, StreamEvent } from "@/types/audit";

const BASE = ""; // proxied via vite

export async function runAudit(url: string, signal?: AbortSignal): Promise<AuditReport> {
  const res = await fetch(`${BASE}/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    signal,
  });
  if (!res.ok) throw new Error(`audit failed: ${res.status}`);
  return res.json();
}

/**
 * Streams audit progress as Server-Sent Events. Yields parsed StreamEvent objects.
 * Usage: `for await (const ev of streamAudit(url)) { ... }`.
 */
export async function* streamAudit(
  url: string,
  signal?: AbortSignal
): AsyncGenerator<StreamEvent, void, void> {
  const res = await fetch(`${BASE}/audit/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ url }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`audit stream failed: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 2);
      if (!block.startsWith("data:")) continue;
      const json = block.slice(5).trim();
      if (!json) continue;
      try {
        yield JSON.parse(json) as StreamEvent;
      } catch {
        // ignore malformed frame
      }
    }
  }
}
