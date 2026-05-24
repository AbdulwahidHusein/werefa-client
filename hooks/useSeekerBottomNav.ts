"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import { resolveAppRole } from "@/lib/navigation";

type Me = components["schemas"]["UserPublic"];

/** Routes where logged-in seekers always get the bottom tab bar (except public home). */
function isSeekerShellPath(pathname: string): boolean {
  return (
    pathname.startsWith("/me/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/")
  );
}

/**
 * Bottom tabs for logged-in customers (service seekers) on every page except `/`.
 * Hidden on the public discover home, and for guests, providers, and admins.
 */
export function useSeekerBottomNav(): boolean {
  const pathname = usePathname();

  const { data: me, isPending } = useQuery({
    queryKey: ["users", "me", "nav"],
    queryFn: () => api<Me>("/users/me"),
    retry: false,
    staleTime: 60_000,
  });

  if (pathname === "/") return false;

  if (isPending) {
    return isSeekerShellPath(pathname);
  }

  if (!me) return false;
  return resolveAppRole(me) === "seeker";
}
