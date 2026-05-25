"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { resolveAppRole } from "@/lib/navigation";
import { useSeekerNavSession } from "@/lib/seeker-nav-context";

type Me = components["schemas"]["UserPublic"];

export type BottomNavMode = false | "seeker" | "guest";

function isPublicSeekerRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/p/") ||
    pathname.startsWith("/me/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname.startsWith("/join")
  );
}

function isGuestNavRoute(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/p/");
}

/**
 * Bottom tab bar: full seeker tabs when logged in as a customer;
 * minimal Discover / Log in / Sign up for guests on public pages.
 */
export function useBottomNavMode(): BottomNavMode {
  const pathname = usePathname();
  const { hasSession, role: serverRole } = useSeekerNavSession();

  const { data: me, isPending, isFetching } = useQuery({
    queryKey: ["users", "me", "nav"],
    queryFn: () => api<Me>("/users/me"),
    retry: false,
    staleTime: 30_000,
    refetchOnMount: "always",
    enabled: hasSession,
  });

  if (!hasSession) {
    return isGuestNavRoute(pathname) ? "guest" : false;
  }

  const role = me ? resolveAppRole(me) : serverRole;

  if (me) {
    return role === "seeker" ? "seeker" : false;
  }

  if ((isPending || isFetching) && serverRole === "seeker") {
    return isPublicSeekerRoute(pathname) ? "seeker" : false;
  }

  if (serverRole === "seeker") {
    return isPublicSeekerRoute(pathname) ? "seeker" : false;
  }

  return false;
}
