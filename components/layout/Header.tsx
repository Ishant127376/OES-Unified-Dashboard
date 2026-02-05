"use client";

import { SystemHealth } from "@/components/system/SystemHealth";
import { UserMenu } from "@/components/user/UserMenu";
import { useTimeGreeting } from "@/hooks/useTimeGreeting";

export function Header() {
  const greeting = useTimeGreeting();

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 md:px-6">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-900">
          {greeting}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SystemHealth />
        <UserMenu />
      </div>
    </header>
  );
}
