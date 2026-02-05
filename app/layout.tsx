import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/components/auth/AuthContext";

export const metadata: Metadata = {
  title: "OES · Unified IoT Dashboard",
  description: "Unified IoT Dashboard for Omkar Energy Solutions (OES)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
