"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, User } from "lucide-react";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!rootRef.current) return;
      const target = event.target as Node;
      if (!rootRef.current.contains(target)) setOpen(false);
    }

    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
          OES
        </span>
        <span className="hidden text-sm font-medium md:inline">OES Admin</span>
        <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            <User className="h-4 w-4" aria-hidden="true" />
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2 text-left text-sm font-medium text-blue-700 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
