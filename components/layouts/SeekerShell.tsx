"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, LogIn, Ticket, User, UserPlus } from "lucide-react";
import type { BottomNavMode } from "@/hooks/useBottomNavMode";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";

type Tab = {
  href: string;
  label: string;
  icon: typeof Home;
  match: (p: string) => boolean;
};

const SEEKER_TABS: Tab[] = [
  { href: "/", label: "Discover", icon: Home, match: (p) => p === "/" },
  {
    href: "/me/tickets",
    label: "My queue",
    icon: Ticket,
    match: (p) => p.startsWith("/me/tickets"),
  },
  {
    href: "/me/notifications",
    label: "Alerts",
    icon: Bell,
    match: (p) => p.startsWith("/me/notifications"),
  },
  {
    href: "/account",
    label: "Account",
    icon: User,
    match: (p) =>
      p === "/account" ||
      p.startsWith("/account/") ||
      p.startsWith("/p/") ||
      p.startsWith("/join"),
  },
];

const GUEST_TABS: Tab[] = [
  { href: "/", label: "Discover", icon: Home, match: (p) => p === "/" },
  {
    href: "/login",
    label: "Log in",
    icon: LogIn,
    match: (p) => p === "/login" || p.startsWith("/login/"),
  },
  {
    href: "/signup",
    label: "Sign up",
    icon: UserPlus,
    match: (p) => p === "/signup" || p.startsWith("/signup/"),
  },
];

export function SeekerShell({
  children,
  navMode = "seeker",
  wide = false,
}: {
  children: React.ReactNode;
  navMode?: BottomNavMode;
  wide?: boolean;
}) {
  const pathname = usePathname();
  const { unreadCount } = useUnreadNotificationCount();
  const showNav = navMode !== false;
  const tabs = navMode === "guest" ? GUEST_TABS : SEEKER_TABS;

  const isProviderPage = pathname.startsWith("/p/");
  const contentWidth = wide || isProviderPage ? "max-w-7xl w-full" : "max-w-md w-full";

  return (
    <>
      {/* Page scrolls normally (window/body); padding clears the fixed tab bar */}
      <div
        className={`seeker-shell-content mx-auto w-full min-h-[var(--app-height,100dvh)] px-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:pt-[max(1rem,env(safe-area-inset-top))] ${contentWidth}`}
        style={
          showNav ? { paddingBottom: "var(--seeker-nav-offset)" } : undefined
        }
      >
        {children}
      </div>

      {showNav ? (
        <nav className="seeker-bottom-nav" aria-label="Main navigation">
          <ul
            className={`mx-auto grid h-[var(--seeker-tab-bar-h)] max-w-7xl gap-0.5 px-2 ${
              tabs.length === 3 ? "grid-cols-3" : "grid-cols-4"
            }`}
          >
            {tabs.map((tab) => {
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
    </>
  );
}
