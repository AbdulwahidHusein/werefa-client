import type { Me } from "@/lib/dal";

export type AppRole = "seeker" | "provider" | "admin";

export function resolveAppRole(me: Me): AppRole {
  if (me.is_superuser) return "admin";
  if (me.user_type === "provider") return "provider";
  return "seeker";
}

/** Sync fallback when async provider path is unavailable (e.g. middleware). */
export function homePathForUser(me: Me): string {
  const role = resolveAppRole(me);
  if (role === "admin") return "/admin";
  if (role === "provider") return "/dashboard/queue";
  return "/";
}

export function homePathForRole(role: AppRole): string {
  if (role === "admin") return "/admin";
  if (role === "provider") return "/dashboard/queue";
  return "/";
}
