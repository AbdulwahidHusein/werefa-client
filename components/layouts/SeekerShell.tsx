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

  return (
    <div
      className="seeker-shell flex min-h-0 w-full flex-col bg-background px-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:pt-[max(1rem,env(safe-area-inset-top))]"
      style={{ minHeight: "var(--app-height, 100dvh)" }}
    >
      {/* Only page content scrolls — tab bar stays fixed like a native app */}
      <main
        className={`seeker-shell-main mx-auto min-h-0 w-full flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] ${contentWidth}`}
        style={
          showNav
            ? { paddingBottom: "var(--seeker-nav-offset)" }
            : undefined
        }
      >
        {children}
      </main>

      {showNav ? (
        <nav className="seeker-bottom-nav" aria-label="Main navigation">
          <ul className="mx-auto grid h-[var(--seeker-tab-bar-h)] max-w-7xl grid-cols-4 gap-0.5 px-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = tab.match(pathname);
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    className={`flex h-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-medium ${
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
