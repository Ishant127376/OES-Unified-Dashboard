"use client";

import { useEffect, useState } from "react";
import { LoginClient } from "@/components/auth/LoginClient";

export default function LoginPage() {
  const [nextPath, setNextPath] = useState("/dashboard");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const next = sp.get("next");
    if (next && next.startsWith("/")) setNextPath(next);
  }, []);

  return <LoginClient nextPath={nextPath} />;
}
