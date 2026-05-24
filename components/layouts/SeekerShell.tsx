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

  return (
    <div className="flex min-h-dvh flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <div
        className={`mx-auto flex w-full flex-1 flex-col pb-4 ${
          wide ? "max-w-6xl" : "max-w-md"
        }`}
      >
        {children}
      </div>
      {showNav ? (
        <nav className="sticky bottom-0 z-30 -mx-4 mt-auto border-t border-border bg-background px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          <ul className="grid grid-cols-4 gap-0.5">
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
