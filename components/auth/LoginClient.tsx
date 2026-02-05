"use client";

import Link from "next/link";
import { useState } from "react";

export function LoginClient({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Login failed");
        return;
      }

      window.location.href = nextPath;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="text-lg font-semibold">OES Dashboard</div>
          <div className="mt-1 text-sm text-slate-300">Sign in to continue.</div>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-50"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-50"
                placeholder="••••••••"
                required
              />
            </div>

            {error ? (
              <div className="rounded-md border border-rose-900/60 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className={
                "w-full rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white " +
                (loading ? "opacity-70" : "hover:bg-blue-600")
              }
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-xs text-slate-400">
            First time setup?{" "}
            <Link href="/signup" className="font-semibold text-slate-200 hover:underline">
              Create the initial Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
