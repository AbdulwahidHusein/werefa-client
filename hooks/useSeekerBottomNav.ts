"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { resolveAppRole } from "@/lib/navigation";
import { useSeekerNavSession } from "@/lib/seeker-nav-context";

type Me = components["schemas"]["UserPublic"];

function isSeekerAppRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/me/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/")
  );
}

/**
 * Bottom tabs for logged-in service seekers.
 * - Home `/`: hidden for guests; visible for seekers only.
 * - Tickets, notifications, account: visible for seekers (uses server session from login).
 */
export function useSeekerBottomNav(): boolean {
  const pathname = usePathname();
  const { hasSession, role: serverRole } = useSeekerNavSession();

  const { data: me } = useQuery({
    queryKey: ["users", "me", "nav"],
    queryFn: () => api<Me>("/users/me"),
    enabled: hasSession,
    retry: false,
    staleTime: 60_000,
  });

  const role = me ? resolveAppRole(me) : serverRole;

  if (role !== "seeker") return false;

  if (pathname === "/") {
    return hasSession;
  }

  if (isSeekerAppRoute(pathname)) {
    return hasSession;
  }

  // Business pages while logged in as seeker
  if (
    pathname.startsWith("/p/") ||
    pathname.startsWith("/join")
  ) {
    return hasSession;
  }

  return false;
}
