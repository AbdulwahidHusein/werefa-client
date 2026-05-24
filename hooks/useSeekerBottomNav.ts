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
    pathname.startsWith("/account/") ||
    pathname.startsWith("/p/") ||
    pathname.startsWith("/join")
  );
}

/**
 * Bottom tabs for logged-in service seekers.
 * Uses live `/users/me` so PWA / home-screen shortcuts stay in sync with cookies.
 */
export function useSeekerBottomNav(): boolean {
  const pathname = usePathname();
  const { hasSession, role: serverRole } = useSeekerNavSession();

  const { data: me, isPending, isFetching } = useQuery({
    queryKey: ["users", "me", "nav"],
    queryFn: () => api<Me>("/users/me"),
    retry: false,
    staleTime: 30_000,
    refetchOnMount: "always",
  });

  const role = me ? resolveAppRole(me) : serverRole;

  if (me) {
    return role === "seeker";
  }

  // Server hint (first paint / while /users/me loads) — important right after login redirect
  if ((isPending || isFetching) && hasSession && serverRole === "seeker") {
    return pathname === "/" || isSeekerAppRoute(pathname);
  }

  if (hasSession && serverRole === "seeker") {
    return pathname === "/" || isSeekerAppRoute(pathname);
  }

  return false;
}
