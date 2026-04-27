"use client";

import Link from "next/link";
import { PropsWithChildren } from "react";
import { FileText, History, LayoutDashboard, Sparkles, UserCircle2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { Button } from "./button";
import { useAuth } from "./auth-provider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/pricing", label: "Pricing", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: UserCircle2 }
];

export const AppShell = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOutUser, user } = useAuth();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar card">
        <Link href="/" className="brand-mark">
          <div className="brand-orb" />
          <div>
            <strong>Resume Optimizer</strong>
            <p>AI-guided job-fit analysis</p>
          </div>
        </Link>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx("sidebar-link", pathname?.startsWith(item.href) && "active")}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-profile">
          <div className="profile-chip">
            <FileText size={18} />
            <div>
              <strong>{user?.displayName ?? user?.email ?? "Signed in"}</strong>
              <p>Your optimizer workspace</p>
            </div>
          </div>
          <Button
            variant="ghost"
            fullWidth
            onClick={async () => {
              await signOutUser();
              router.push("/auth");
            }}
          >
            Sign out
          </Button>
        </div>
      </aside>

      <main className="dashboard-main">{children}</main>
    </div>
  );
};
