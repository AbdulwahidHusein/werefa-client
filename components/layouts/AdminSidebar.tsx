"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";

import { logoutAction } from "@/app/(auth)/actions";
import { WerefaLogo } from "@/components/WerefaLogo";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    match: (p: string) => p.startsWith("/admin/users"),
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
    match: (p: string) => p.startsWith("/admin/analytics"),
  },
  {
    href: "/admin/system",
    label: "System health",
    icon: Activity,
    match: (p: string) => p.startsWith("/admin/system"),
  },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-4 py-4">
        <div className="flex flex-col gap-1">
          <WerefaLogo variant="mark" size="md" href="/admin" onClick={onNavigate} />
          <p className="text-xs text-muted">Administration</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {LINKS.map(({ href, label, icon: Icon, exact, match }) => {
          const active = exact
            ? pathname === href
            : match
              ? match(pathname)
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border border-border bg-background text-foreground"
                  : "text-muted hover:bg-background hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border p-2">
        <form action={logoutAction}>
          <button
            type="submit"
            onClick={onNavigate}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
