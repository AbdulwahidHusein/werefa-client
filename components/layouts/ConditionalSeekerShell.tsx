"use client";

import { usePathname } from "next/navigation";

import { useSeekerBottomNav } from "@/hooks/useSeekerBottomNav";
import { SeekerShell } from "./SeekerShell";

const AUTH_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/otp",
];

function isAuthPath(pathname: string): boolean {
  return AUTH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function usesDeskShell(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin")
  );
}

export function ConditionalSeekerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNav = useSeekerBottomNav();

  if (isAuthPath(pathname) || usesDeskShell(pathname)) {
    return <>{children}</>;
  }

  if (
    pathname.startsWith("/join") ||
    pathname.startsWith("/test-token")
  ) {
    return <>{children}</>;
  }

  const isDiscoverHome = pathname === "/";

  return (
    <SeekerShell showNav={showNav} wide={isDiscoverHome}>
      {children}
    </SeekerShell>
  );
}
