"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-50">
      <div className="flex h-16 items-center px-4">
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-wide">
            Omkar Energy Solutions
          </div>
          <div className="text-xs text-slate-300">Unified IoT Dashboard</div>
        </div>
      </div>

      <nav className="px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition " +
                (isActive
                  ? "bg-slate-800 text-slate-50"
                  : "text-slate-200 hover:bg-slate-800 hover:text-slate-50")
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
