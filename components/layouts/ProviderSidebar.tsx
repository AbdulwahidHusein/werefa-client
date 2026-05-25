"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import { WerefaLogo } from "@/components/WerefaLogo";
import {
  BarChart3,
  Building2,
  LayoutList,
  ListOrdered,
  LogOut,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof ListOrdered;
  match: (p: string) => boolean;
};

function buildLinks(queueHref: string | null | undefined): NavItem[] {
  const queuePath = queueHref ?? "/dashboard/queue";
  return [
    {
      href: queuePath,
      label: "Queue Board",
      icon: ListOrdered,
      match: (p) => p.includes("/queue"),
    },
    {
      href: "/dashboard/services",
      label: "Services",
      icon: Wrench,
      match: (p) =>
        p.startsWith("/dashboard/services") && !p.includes("/queue"),
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: BarChart3,
      match: (p) => p.startsWith("/dashboard/analytics"),
    },
    {
      href: "/dashboard/members",
      label: "Team",
      icon: Users,
      match: (p) => p.startsWith("/dashboard/members"),
    },
    {
      href: "/dashboard",
      label: "My Business",
      icon: Building2,
      match: (p) =>
        p === "/dashboard" || p.startsWith("/dashboard/setup"),
    },
    {
      href: "/dashboard/settings/profile",
      label: "Settings",
      icon: Settings,
      match: (p) => p.startsWith("/dashboard/settings"),
    },
  ];
}

export function ProviderSidebar({
  businessName,
  queueHref,
  onNavigate,
}: {
  businessName?: string | null;
  queueHref?: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const links = buildLinks(queueHref);

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-surface">
      {/* Brand / business header */}
      <div className="border-b border-border px-4 py-4">
        <Link href="/dashboard" onClick={onNavigate} className="block group space-y-1">
          <WerefaLogo size="sm" href={null} />
          {businessName ? (
            <p className="truncate text-sm font-semibold text-foreground leading-tight">
              {businessName}
            </p>
          ) : (
            <p className="text-xs text-muted">Provider dashboard</p>
          )}
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-0.5 p-2 overflow-y-auto">
        {links.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-background hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${active ? "text-accent" : ""}`}
              />
              {label}
              {active ? (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer links */}
      <div className="border-t border-border p-2 flex flex-col gap-0.5">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-muted hover:bg-background hover:text-foreground transition-colors"
        >
          <LayoutList className="h-4 w-4 shrink-0" />
          Customer view
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            onClick={onNavigate}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-muted hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
