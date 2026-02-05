"use client";

import { AlertTriangle, X } from "lucide-react";

export function Toast({
  title,
  message,
  onClose,
}: {
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-50 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-rose-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 p-3">
        <div className="mt-0.5 rounded-md bg-rose-50 p-2 text-rose-700">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-0.5 text-sm text-slate-600">{message}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-500 hover:bg-slate-50"
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
