"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../components/app-shell";
import { useAuth } from "../../components/auth-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    }
  }, [isLoading, router, user]);

  if (isLoading || !user) {
    return <div className="auth-page">Loading your workspace…</div>;
  }

  return <AppShell>{children}</AppShell>;
}
