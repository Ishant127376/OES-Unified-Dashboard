"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { UserRole } from "@/models/User";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  assignedDevices: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  role: UserRole | null;
  assignedDeviceIds: string[];
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as { user?: AuthUser };
  return data.user ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    try {
      setUser(await fetchMe());
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  }

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const role = user?.role ?? null;
    return {
      user,
      isLoading,
      isAdmin: role === "Admin",
      role,
      assignedDeviceIds: user?.assignedDevices ?? [],
      refresh,
      signOut,
    };
  }, [isLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
