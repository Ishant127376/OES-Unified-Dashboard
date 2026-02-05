"use client";

import { useEffect, useMemo, useState } from "react";

function getGreetingByHour(hour: number) {
  if (hour < 12) return "Good morning, welcome back";
  if (hour < 18) return "Good afternoon, welcome back";
  return "Good evening, welcome back";
}

export function useTimeGreeting() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => getGreetingByHour(now.getHours()), [now]);
}
