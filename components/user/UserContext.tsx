"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type UserRole = "Admin" | "Sub-User";

export type User = {
  name: string;
  role: UserRole;
};

type UserContextValue = {
  user: User;
  setRole: (role: UserRole) => void;
  isAdmin: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window === "undefined") return "Admin";
    const saved = window.localStorage.getItem("oes_user_role");
    return saved === "Sub-User" ? "Sub-User" : "Admin";
  });

  const value = useMemo<UserContextValue>(() => {
    const user: User = { name: "OES Admin", role };
    return {
      user,
      setRole: (nextRole) => {
        setRole(nextRole);
        window.localStorage.setItem("oes_user_role", nextRole);
      },
      isAdmin: role === "Admin",
    };
  }, [role]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
}
