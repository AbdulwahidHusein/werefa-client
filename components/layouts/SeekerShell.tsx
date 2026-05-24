"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, Ticket, User } from "lucide-react";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";

const TABS = [
  { href: "/", label: "Discover", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/me/tickets",
    label: "My queue",
    icon: Ticket,
    match: (p: string) => p.startsWith("/me/tickets"),
  },
  {
    href: "/me/notifications",
    label: "Alerts",
    icon: Bell,
    match: (p: string) => p.startsWith("/me/notifications"),
  },
  {
    href: "/account",
    label: "Account",
    icon: User,
    match: (p: string) =>
      p === "/account" ||
      p.startsWith("/account/") ||
      p.startsWith("/p/") ||
      p.startsWith("/join"),
  },
];

export function SeekerShell({
  children,
  showNav = true,
  wide = false,
}: {
  children: React.ReactNode;
  showNav?: boolean;
  wide?: boolean;
}) {
  const pathname = usePathname();
  const { unreadCount } = useUnreadNotificationCount();

  const isProviderPage = pathname.startsWith("/p/");
  const contentWidth = wide || isProviderPage ? "max-w-7xl w-full" : "max-w-md w-full";

  const navHeight =
    "calc(4rem + env(safe-area-inset-bottom, 0px))";

  return (
    <div
      className="flex min-h-dvh flex-col px-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:pt-[max(1rem,env(safe-area-inset-top))]"
      style={showNav ? { paddingBottom: navHeight } : undefined}
    >
      <div className={`mx-auto flex w-full flex-1 flex-col ${contentWidth}`}>
        {children}
      </div>
      {showNav ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-[100] isolate transform-gpu border-t border-border bg-background px-2 pt-2 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
          style={{
            paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))",
          }}
          aria-label="Main navigation"
        >
          <ul className="mx-auto grid max-w-7xl grid-cols-4 gap-0.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = tab.match(pathname);
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    className={`flex h-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-medium ${
                      active
                        ? "text-foreground"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <span className="relative">
                      <Icon className="h-5 w-5" aria-hidden />
                      {tab.href === "/me/notifications" && unreadCount > 0 ? (
                        <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      ) : null}
                    </span>
                    <span>{tab.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
