"use client";

import { useEffect, useMemo, useRef } from "react";
import type { TelemetryPayload } from "@/hooks/useIoTSimulator";

export function IncomingMessageLog({
  messages,
}: {
  messages: TelemetryPayload[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const lines = useMemo(() => {
    return messages.map((m) => JSON.stringify(m));
  }, [messages]);

  useEffect(() => {
    // Keep the view pinned to the top so newest messages are immediately visible.
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [lines.length]);

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
        Incoming Message Log
      </div>
      <div
        ref={containerRef}
        className="max-h-64 overflow-auto bg-slate-950 p-3 font-mono text-xs leading-5 text-emerald-400"
      >
        {lines.length ? (
          <div className="space-y-1">
            {lines.map((line, idx) => (
              <div key={idx} className="break-words">
                {line}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-emerald-400/80">No messages yet…</div>
        )}
      </div>
    </div>
  );
}
