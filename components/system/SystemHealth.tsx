"use client";

export function SystemHealth() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5">
      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      <span className="text-xs font-medium text-slate-700">System Health</span>
      <span className="text-xs text-slate-500">Online</span>
    </div>
  );
}
