"use client";

import type { ReactNode } from "react";
import type { UserRole } from "@/models/User";
import { useAuth } from "@/components/auth/AuthContext";

export function RoleGuard({
  role,
  children,
  fallback = null,
}: {
  role: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { role: currentRole, isLoading } = useAuth();
  if (isLoading) return null;
  const allowed = Array.isArray(role)
    ? currentRole !== null && role.includes(currentRole)
    : currentRole === role;
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
